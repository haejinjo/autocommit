import fetch from 'node-fetch-native';
import OpenAI from 'openai';
import { CommitConfigBuilder } from './cli_interactions/commit-config-builder.mjs';
import { StepLoader } from './cli_interactions/step-loader.mjs';


export async function getCommitMessage(diff, config) {
  const loader = new StepLoader();
  try {
    const commitConfigBuilder = new CommitConfigBuilder();
    const commitConfig = await commitConfigBuilder.build();
    console.log('📋 Using:', commitConfig);

    loader.start(`Crafting LLM prompt with ${commitConfig.isPreset ? 'preset config' : 'user preferences'}.`);
    // Build instructions based on preset or user provided custom config
    let instructions = [];
    if (commitConfig.maxLines) {
      instructions.push(
        `CRITICAL CONSTRAINT: Your response must contain NO MORE than ${commitConfig.maxLines} bullet points.`,
        'This constraint overrides ALL other formatting instructions.',
        'If you have more items, combine related changes into single bullet points.',
        ''
      );
    }

    const personaPrompt = [
      'You are a senior software engineer writing a Pull Request (PR) or Merge Request (MR) description for a project.',
      'You are given a Git patch (diff) representing code changes from a feature branch.',
      '',
    ];

    const userModsPrompt = [];

    if (commitConfig.explainDesign) {
      userModsPrompt.push('For each code change, include brief, natural explanations of the design intention or architectural reasoning.');
    }
    if (commitConfig.changelog) {
      userModsPrompt.push(
        'Focus only on user-facing changes that would matter in a changelog.',
        'Write like you\'re documenting a release - what will users notice?'
      );
    }


    instructions = [...instructions, ...personaPrompt, ...userModsPrompt];

    // Now build instructions based on commitConfig
    if (commitConfig.mode === 'mr') {
      instructions.push(
        'Your task is to generate a concise and professional GitLab MR description with the following sections, using markdown format:',
        '',
        '**TITLE:** Perfectly captures what this changeset does. Should be specific enough that someone could understand the scope without reading the description.',
        '',
        '**1) SUMMARY:** Speak as the author in a casual but still detail-oriented manner. Answer what this changeset accomplishes and why it was needed to a colleague over coffee. Focus on the business/user value, and high-level technical implementation details.',
        'If there are broken states, compilation issues, or clearly unfinished work, mention these limitations clearly (e.g., "This MR improves the layout system but leaves the authentication flow incomplete" or "Refactors the API layer though some endpoints still return 500 errors").',
        'Frame blocking issues as "...but leaves X broken/incomplete" and non-critical issues as "...with Y intentionally left for future work" or "...while keeping Z minimal for now".',
        'If architectural or design decisions were made, explain WHY these specific technical approaches were chosen. Include trade-offs or alternatives to consider.',
        '',
        '**2) CHANGES:** Bullet points listing major technical changes (e.g., new routes, modules, config changes, service logic, refactors), grouped logically by purpose. Focus on WHAT was changed technically.  Avoid repeating details already covered in SUMMARY.',
        '',
        '**3) NOTES FOR REVIEWERS (optional):** Things that require fresh eyes or different perspectives - complex logic that needs validation, potential edge cases, security considerations, performance implications, accessibility concerns, or areas where the implementation might have unintended consequences that the author might have missed.',
        '',
        'Requirements:',
        '- Each section should complement, not repeat, information from other sections. e.g. CHANGES can explain technical specifics about but never repeat what was said in SUMMARY',
        '- SUMMARY should be business/product focused (what user/stakeholder value was delivered)',
        '- SUMMARY should be honest about completeness - clearly state if anything is broken, incomplete, or non-functional',
        '- CHANGES should be technical implementation focused (what code/systems were modified)', 
        '- NOTES FOR REVIEWERS should be review-process focused (what reviewers should pay attention to)',
        '- Total length must be under 1400 characters (including section headings)',
        '- Use neutral, descriptive language grounded in the changes in the code diff'
      );
    } else if (commitConfig.explainDesign || commitConfig.changelog || commitConfig.internal) {
      if (commitConfig.longform) {
        instructions.push(
          'Write a comprehensive technical commit message with detailed narrative explanations.',
          '',
          '**Title (50-72 chars):** Capitalize system names as proper nouns. Be specific about what changed in each system. Use precise verbs: refactor, rebuild, migrate, implement.',
          '',
          '**Body:** Lead with 1-2 sentences summarizing technical scope. Write detailed paragraphs explaining the technical reasoning and implementation details for each major change. Use flowing narrative that explains the "why" behind technical decisions.',
          '',
          '**Additional changes:** Always format as bulleted list for secondary updates.',
          '',
          '**Language:** Use domain-appropriate terminology with detailed explanations. Include user experience impact and technical trade-offs.'
        );
      } else {
        instructions.push('Write a scannable technical commit message optimized for maintainers and code reviewers.',
        '',
        '**Title (50-72 chars):** Capitalize system names as proper nouns. Be specific about what changed in each system. Use precise verbs: refactor, rebuild, migrate, implement.',
        '',
        '**Body:** Lead with 1-2 sentences summarizing technical scope. Use bullet points for major changes in distinct systems/areas. Keep descriptions focused on technical implementation details.',
        '',
        '**Additional changes:** Always format as bulleted list for secondary updates.',
        '',
        '**Language:** Use precise technical language that matches actual complexity. Focus on what was changed and how, not lengthy explanations of why.'
        );
      }
    } else {
      instructions.push(
        'Write a concise, technical Git commit message in imperative mood.',
        'Be specific about what systems or components were changed.',
        'Start with the main technical accomplishment in 50-72 characters.',
        'Capitalize feature/page names as proper nouns: "About Page", "Photography Gallery", "User Dashboard".',
        'Include key technical terms: component names, layout systems, or technologies used.',
        'Use precise technical verbs: "refactor", "rebuild", "migrate", "implement", "replace".',
        'Focus on what was built, fixed, or refactored - not individual files.',
        'Connect multiple related changes into a single coherent statement.',
        'Skip trivial formatting or test updates unless they\'re the primary change.',
        'Output only the commit message - no explanations or prefatory text.'
      );
    }
    // Build and send prompt
    const prompt = [
      instructions.join('\n'),
      '',
      'Git diff:',
      '---',
      diff
    ].join('\n');

    loader.completeCurrentStep();

    let response;
    const modelName = config.provider === 'gpt' ? config.model : config.model;
    loader.nextStep(`Calling ${config.provider.toUpperCase()} API (${modelName}) with temperature ${config.temperature}`);

    if (config.provider === 'gpt') {
      const openai = new OpenAI({ apiKey: config.openaiApiKey });
      const res = await openai.chat.completions.create({
        model: config.model,
        temperature: config.temperature,
        messages: [{ role: 'user', content: prompt }]
      });
      response = res.choices?.[0]?.message?.content?.trim() || '[Model call failed]';
    }

    if (config.provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.claudeApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          temperature: config.temperature,
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!res.ok) {
        console.error(`Model API error: ${res.status} ${res.statusText}`);
        try {
          const errorBody = await res.json();
          console.error('Error details:', errorBody);
        } catch (err) {
          console.error('Failed to parse error body.');
        }
        response = '[Model call failed]';
      }

      const data = await res.json();
      response = data.content?.[0]?.text?.trim() || '[Model call failed]';
    }

    loader.completeCurrentStep();
    return response;

  } catch (error) {
    loader.fail(error.message);
    throw error;
  }
}


// //   // First, determine if this is for MR description or commit message
// //   const writeCommitMessage = useDefaults ? false : (await rl.question('Generate MR description as commit message? (y/n*)', 'n')) === 'y';

// //   // If MR description, skip all other options since it has its own format
// //   if (!writeCommitMessage) {
// //     // Regular commit message options
// //     const useShortform = useDefaults ? false : (await rl.question('Shorter, at expense of detail? (y/n*)', 'y')) === 'y';

// //     const explainDesign = useDefaults ? true : (await rl.question('Add design rationale for changes? (y*/n) ', 'y')) === 'y';

// //     // Only show internal mode if design rationale is enabled
// //     const internal = useDefaults || !explainDesign ? false : (await rl.question('Note-to-self mode? Good for temp/WIP branches. (y/n*)', 'n')) === 'y';

// //     // Only show changelog if not in internal mode
// //     const changelog = useDefaults || internal ? false : (await rl.question('Only mentions user-visible changes like a changelog? (y/n*)', 'n')) === 'y';

// //     const maxLinesInput = useDefaults ? '' : await rl.question('Max bullet points (optional): ');
// //     const maxLines = maxLinesInput.trim() === '' ? null : parseInt(maxLinesInput);
// //   }

// //   rl.close();

// //   const instructions = [];

// //   if (writeCommitMessage) {
// //     instructions.push(
// //       'You are a senior software engineer writing a Github Pull Request or GitLab Merge Request description.',
// //       'Analyze the Git diff and create a professional MR description that tells a clear, story about the changes.',
// //       'Every statement has to be verifiable by pointing to a line in the code diff.',
// //       '',
// //       'Write in a conversational yet professional tone, as if briefing a technical teammate on your work.',
// //       '',
// //       '**Required Structure (markdown format):**',
// //       '1) **SUMMARY**: 1-2 sentences explaining what this MR accomplishes and why (explained to a Product Manager or CEO)',
// //       '2) **CHANGES**: Key technical changes grouped logically (new features, refactors, fixes)',
// //       '3) **RATIONALE** (if applicable): Brief explanation of design decisions or architectural choices',
// //       '4) **NOTES FOR REVIEWERS** (if applicable): Areas needing special attention or potential concerns',
// //       '',
// //       '**Writing Guidelines:**',
// //       '- Keep total length under 1400 characters including headers',
// //       '- Connect related changes into a cohesive narrative',
// //       '- Focus on meaningful changes that affect functionality or architecture',
// //       '- Use bullet points for CHANGES section, flowing sentences elsewhere',
// //       '- Avoid file-by-file documentation unless a single file was the main focus',
// //       '- Write like you\'re helping reviewers understand the bigger picture'
// //     );
// //   } else if (
// //     explainDesign ||
// //     changelog ||
// //     internal ||
// //     maxLines
// //   ) {
// //     if (useShortform) {
// //       instructions.push(
// //         'Write a scannable technical commit message optimized for maintainers and code reviewers.',
// //         '',
// //         '**Title (50-72 chars):** Capitalize system names as proper nouns. Be specific about what changed in each system. Use precise verbs: refactor, rebuild, migrate, implement.',
// //         '',
// //         '**Body:** Lead with 1-2 sentences summarizing technical scope. Use bullet points for major changes in distinct systems/areas. Keep descriptions focused on technical implementation details.',
// //         '',
// //         '**Additional changes:** Always format as bulleted list for secondary updates.',
// //         '',
// //         '**Language:** Use precise technical language that matches actual complexity. Focus on what was changed and how, not lengthy explanations of why.'
// //       );
// //     } else {
// //       instructions.push(
// //         'Write a comprehensive technical commit message with detailed narrative explanations.',
// //         '',
// //         '**Title (50-72 chars):** Capitalize system names as proper nouns. Be specific about what changed in each system. Use precise verbs: refactor, rebuild, migrate, implement.',
// //         '',
// //         '**Body:** Lead with 1-2 sentences summarizing technical scope. Write detailed paragraphs explaining the technical reasoning and implementation details for each major change. Use flowing narrative that explains the "why" behind technical decisions.',
// //         '',
// //         '**Additional changes:** Always format as bulleted list for secondary updates.',
// //         '',
// //         '**Language:** Use domain-appropriate terminology with detailed explanations. Include user experience impact and technical trade-offs.'
// //       );
// //     }
// //     // instructions.push(
// //     //   'You are a senior software engineer creating a comprehensive technical commit message.',
// //     //   'Document all significant changes with precision while maintaining clarity for code reviewers.',
// //     //   '',
// //     //   '**Title Requirements (50-72 characters):**',
// //     //   '- Be specific about what changed in each system: "refactor Auth Service endpoints and Settings styling"',
// //     //   '- Capitalize system/service names as proper nouns: "API Gateway", "Settings Page", "CI Pipeline", "User Service"',
// //     //   '- Use precise technical verbs: "refactor", "rebuild", "migrate", "implement", "replace", "add", "configure"',
// //     //   '- Include primary technical pattern: "caching layer", "authentication flow", "deployment pipeline", "state management"',
// //     //   '',
// //     //   '**Body Organization:**',
// //     //   '- Lead with 1-2 sentences summarizing the main technical scope and impact',
// //     //   '- Use strategic bullet points for distinct technical areas (3+ separate systems/layers)',
// //     //   '- Use flowing paragraphs for related changes within the same system or service',
// //     //   '- End with "Additional changes" section for important secondary updates',
// //     //   '',
// //     //   '**Technical Language:**',
// //     //   '- Use domain-appropriate terms: "migrate from Redis to Memcached", "replace masonry with CSS Grid", "replace REST with GraphQL", "refactor database schema"',
// //     //   '- Be direct with simpler changes: "add health check endpoint", "update Docker base image", "configure load balancer"',
// //     //   '- Match language intensity to actual technical complexity ("integration" reserved for APIs, external services, data pipelines, not images added to an HTML page)',
// //     //   '',
// //     //   '**Content Coverage:**',
// //     //   '- Document architectural changes: service boundaries, data flow, infrastructure patterns, security models',
// //     //   '- Include specific implementations: database migrations, API changes, infrastructure configs, deployment updates',
// //     //   '- Mention operational implications: performance improvements, scaling changes, monitoring additions, security updates',
// //     //   '- Always capture secondary changes in "Additional changes":',
// //     //   '  • Monitoring and performance improvements', 
// //     //   '  • Security and authentication changes',
// //     //   '  • Developer tooling and testing enhancements',
// //     //   '  • Frontend external API calls and accessibility fixes',
// //     //   '',
// //     //   '**Clarity Guidelines:**',
// //     //   '- Make each bullet point a complete technical thought',
// //     //   '- Group related technical changes to eliminate redundancy',
// //     //   '- Ensure the message tells a complete story of what was accomplished',
// //     //   '- Structure for easy scanning by technical reviewers across all domains'
// //     // );
// //   } else {
// //     instructions.push(
// //       'Write a concise, technical Git commit message in imperative mood.',
// //       'Be specific about what systems or components were changed.',
// //       'Start with the main technical accomplishment in 50-72 characters.',
// //       'Capitalize feature/page names as proper nouns: "About Page", "Photography Gallery", "User Dashboard".',
// //       'Include key technical terms: component names, layout systems, or technologies used.',
// //       'Use precise technical verbs: "refactor", "rebuild", "migrate", "implement", "replace".',
// //       'Focus on what was built, fixed, or refactored - not individual files.',
// //       'Connect multiple related changes into a single coherent statement.',
// //       'Skip trivial formatting or test updates unless they\'re the primary change.',
// //       'Output only the commit message - no explanations or prefatory text.'
// //     );
// //   }

// // // Design explanation modifier
// // if (explainDesign) {
// //   instructions.push(
// //     'For each change, include brief, natural explanations of the design intention or architectural reasoning.',
// //   );
// // }

// // // Changelog modifier  
// // if (changelog) {
// //   instructions.push(
// //     'Focus only on user-facing changes that would matter in a changelog.',
// //     'Write like you\'re documenting a release - what will users notice?',
// //     'Skip internal refactors and technical debt unless they impact user experience.'
// //   );
// // }

// // // Internal/WIP modifier
// // if (internal) {
// //   instructions.push(
// //     'Keep it minimal and technical - this is an internal note-to-self.',
// //     'Focus on the core change without extensive explanation.',
// //     'Use shorthand that other developers on the team would understand.'
// //   );
// // }

// // // Line limit modifier
// // if (maxLines) {
// //   instructions.push(
// //     `REQUIRED: Limit to ${maxLines} key points maximum.`,
// //     'Prioritize the most important changes and group smaller ones together.',
// //     'Each point should be a complete thought, not a fragment.'
// //   );
// // }
