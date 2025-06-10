#!/usr/bin/env node
import { getDiff } from './get-diff.mjs';
import { loadConfig } from './config.mjs';
import { getCommitMessage } from './llm-client.mjs';
import fs, { readFileSync } from 'fs';
import os from 'os';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { getReadlineInterface, closeReadlineInterface } from './cli_interactions/readline-singleton.mjs';
import { AsciiArt } from './cli_interactions/ascii-art.mjs';


// Handle help and version FIRST, before any other logic
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
    AutoCommit CLI - AI-powered Git commit message generator

    Inspects staged diff output (git diff --cached) to generate contextual commit messages
    or MR descriptions for you to confirm, retry (sparingly!), or edit directly from the terminal.
    
    Usage:
      autocommit              Generate commit message for staged changes
      autocommit --setup      Run setup wizard to create .autocommitrc
      autocommit --help       Show this help
      autocommit --version    Show version
    
    Setup:
      On first use, run 'autocommit --setup' to create .autocommitrc with your:
      • AI provider (OpenAI or Claude) 
      • API key
      • Model and temperature preferences
      • Target branch for diffs
    
      The .autocommitrc file can be modified anytime to update your settings.
    
    Examples:
      # First time setup
      autocommit --setup
      
      # Regular usage (requires .autocommitrc)
      git add .
      autocommit
    
    Requirements:
      • .autocommitrc file (created via --setup)
      • Staged git changes to analyze
      • Valid API key for chosen AI provider
    `);
      process.exit(0);
    }

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));
  console.log(pkg.version);
  process.exit(0);
}

if (process.argv.includes('--setup')) {
  const { runSetup } = await import('./setup.mjs');
  await runSetup();
  process.exit(0);
}

// Fixed helper function - doesn't close readline
const ask = async (question) => {
  const rl = getReadlineInterface();
  const answer = await rl.question(question);
  return answer.trim();
};

// Load config and get staged diff
const config = loadConfig();
const diff = await getDiff({
  targetBranch: config.targetBranch,
  stagedOnly: true,
  noFetch: true
});

if (!diff || diff.trim().length === 0) {
  console.log('⚠️ No staged changes to commit.');
  process.exit(0);
}


try {
  let message = await getCommitMessage(diff, config);
  let isRetry = false;

  while (true) {
    const wrappedMessage = AsciiArt.wrapContent(message, isRetry);
    console.log(wrappedMessage);
    
    const action = await ask('(a)ccept / (e)dit / (r)etry / (q)uit: ');

    if (action === 'a') {
      const result = spawnSync('git', ['commit', '-m', message], { stdio: 'inherit' });
      if (result.status === 0) {
        console.log('✅ Committed.');
      } else {
        console.log('❌ Commit failed.');
      }
      break;
    } else if (action === 'e') {
      const tmp = path.join(os.tmpdir(), 'autocommit-msg.txt');
      fs.writeFileSync(tmp, message);
      
      // Use spawn for interactive editor
      const editorProcess = spawn('nano', [tmp], { stdio: 'inherit' });
      
      // Wait for editor to close
      await new Promise((resolve) => {
        editorProcess.on('close', resolve);
      });
      
      const edited = fs.readFileSync(tmp, 'utf-8').trim();
      fs.unlinkSync(tmp);
      
      const commitResult = spawnSync('git', ['commit', '-m', edited], { stdio: 'inherit' });
      if (commitResult.status === 0) {
        console.log('✅ Committed edited message.');
      } else {
        console.log('❌ Commit failed.');
      }
      break;
    } else if (action === 'r') {
      message = await getCommitMessage(diff, config);
      isRetry = true;
    } else if (action === 'q') {
      console.log('❌ Cancelled.');
      break;
    } else {
      console.log('❓ Invalid option. Please choose (a)ccept, (e)dit, (r)etry, or (q)uit.');
    }
  }
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  closeReadlineInterface();
  process.exit(0);
}