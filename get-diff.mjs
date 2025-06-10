import { execSync } from 'child_process';

export function getDiff({ targetBranch = 'main', stagedOnly = false, noFetch = false }) {
  try {
    if (!noFetch) {
      execSync('git fetch', { stdio: 'ignore' });
    }

    // If `stagedOnly` is true, show only what's currently staged for commit (git diff --cached),
    // which is useful for generating commit messages based strictly on selected changes.
    //
    // Otherwise, use `git diff main...HEAD` to compare the current branch against the merge-base
    // with `main`. This isolates only the changes introduced on the current branch,
    // regardless of any new commits pushed to origin/main.
    // It ensures the diff reflects what this branch changes *without* showing upstream noise.
    const diffCommand = stagedOnly
      ? 'git diff --cached --unified=20'
      : `git diff ${targetBranch}...HEAD`;

    const diff = execSync(diffCommand, { encoding: 'utf-8' });
    return diff || null;
  } catch (error) {
    console.error('Error getting diff:', error.message);
    return null;
  }
} 