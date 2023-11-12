import { execCommand } from './exec-command.js';

async function topLevelDirectory(): Promise<string> {
  return execCommand('git rev-parse --show-toplevel');
}

async function insideWorkTree(): Promise<boolean> {
  try {
    const isGitRepo = await execCommand('git rev-parse --is-inside-work-tree');
    return isGitRepo === 'true';
  } catch {
    return false;
  }
}

export { topLevelDirectory, insideWorkTree };
