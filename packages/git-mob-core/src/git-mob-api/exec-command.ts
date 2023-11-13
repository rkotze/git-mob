import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { getConfig as cmGetConfig } from '../config-manager.js';

type ExecCommandOptions = {
  encoding: string;
  cwd?: string;
};

// Runs the given command in a shell.
export async function execCommand(command: string): Promise<string> {
  const cmdConfig: ExecCommandOptions = { encoding: 'utf8' };
  const processCwd = cmGetConfig('processCwd');
  if (processCwd) cmdConfig.cwd = processCwd;
  const execAsync = promisify(exec);
  const { stderr, stdout } = await execAsync(command, cmdConfig);

  if (stderr) {
    throw new Error(`Git mob core execCommand: "${command}" ${stderr.trim()}`);
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

export async function setConfig(key: string, value: string) {
  try {
    await execCommand(`git config ${key} "${value}"`);
  } catch {
    const message = `Option ${key} has multiple values. Cannot overwrite multiple values for option ${key} with a single value.`;
    throw new Error(`Git mob core setConfig: ${message}`);
  }
}

export async function getRepoAuthors() {
  return execCommand('git shortlog -sen HEAD');
}
