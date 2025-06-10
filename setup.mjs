import { writeFile } from 'node:fs/promises'; // ✅ Use promises version here
import { readFileSync, appendFileSync, existsSync } from 'node:fs'; // ✅ Sync ops okay
import { getReadlineInterface } from './cli_interactions/readline-singleton.mjs';

export async function runSetup() {
  const rl = getReadlineInterface();

  console.log('\n🛠️  AutoCommit Setup\n');

  console.log('\nYou can always update your .autocommitrc later\n');
  console.log('\nNote that the generated .autocommitrc gets added to the current directory\'s .gitignore\n');
  console.log('\n🚨 Important: Check .gitignore into version control to avoid leaking API Keys!\n');

  const provider = await rl.question('Which? (claude/gpt) [claude]: ') || 'claude';

  const model = await rl.question(
    provider === 'openai'
      ? 'Model? (e.g. gpt-4o) [gpt-4o]: '
      : 'Model? (e.g. claude-3-haiku-20240307) [claude-3-haiku-20240307]: '
  ) || (provider === 'openai' ? 'gpt-4o' : 'claude-3-haiku-20240307');

  const apiKey = await rl.question('Paste your API key (sk-...): ');

  const targetBranch = await rl.question('Target branch? [origin/main]: ') || 'origin/main';
  const temp = await rl.question('Temperature? [0.3]: ') || '0.3';

  const config = {
    provider,
    model,
    temperature: parseFloat(temp),
    targetBranch
  };
  
  if (provider === 'openai') {
    config.openaiApiKey = apiKey;
  } else {
    config.claudeApiKey = apiKey;
  }

  await writeFile('.autocommitrc', JSON.stringify(config, null, 2));
  console.log('\n✅ .autocommitrc created!\n');
  rl.close();

  const gitignorePath = '.gitignore';
  const entry = '.autocommitrc';

  if (existsSync(gitignorePath)) {
    const contents = readFileSync(gitignorePath, 'utf-8');
    if (!contents.includes(entry)) {
      appendFileSync(gitignorePath, `\n${entry}\n`);
      console.log('📄 Added .autocommitrc to .gitignore');
    }
  } else {
    await writeFile(gitignorePath, `${entry}\n`);
    console.log('📄 Created .gitignore and added .autocommitrc to it');
  }
}
