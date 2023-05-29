import { exec } from 'node:child_process';
import { promisify } from 'node:util';

// Runs the given command in a shell.
export async function execCommand(command: string): Promise<string> {
  const execAsync = promisify(exec);
  const { stderr, stdout } = await execAsync(command, { encoding: 'utf8' });

  if (stderr) {
    throw new Error(`GitMob execCommand: "${command}" ${stderr.trim()}`);
  }

  return stdout.trim();
}

export async function getConfig(key: string) {
  try {
    return await execCommand(`git config --get ${key}`);
  } catch {
    return undefined;
  }
}

export async function getAllConfig(key: string) {
  try {
    return await execCommand(`git config --get-all ${key}`);
  } catch {
    return undefined;
  }
}
