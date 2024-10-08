import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { topLevelDirectory } from './git-rev-parse.js';
import { getConfig, setConfig } from './exec-command.js';

async function setCommitTemplate() {
  const hasTemplate = await getConfig('commit.template');
  if (!hasTemplate) {
    await setConfig('--global commit.template', gitMessagePath());
  }
}

async function resolveGitMessagePath(templatePath?: string) {
  if (process.env.GITMOB_MESSAGE_PATH) {
    return resolve(process.env.GITMOB_MESSAGE_PATH);
  }

  if (templatePath) return resolve(await topLevelDirectory(), templatePath);

  return resolve(gitMessagePath());
}

function gitMessagePath() {
  return join(homedir(), '.gitmessage');
}

export { resolveGitMessagePath, setCommitTemplate };
