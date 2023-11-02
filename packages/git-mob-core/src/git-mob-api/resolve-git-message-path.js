import { resolve, relative, join } from 'node:path';
import { homedir } from 'node:os';

import { config } from '../commands.js';
import { topLevelDirectory } from './git-rev-parse.js';

function setCommitTemplate() {
  if (!config.has('commit.template')) {
    config.set('--global commit.template', gitMessagePath());
  }
}

function resolveGitMessagePath(templatePath) {
  if (process.env.GITMOB_MESSAGE_PATH) {
    return resolve(process.env.GITMOB_MESSAGE_PATH);
  }

  if (templatePath) return resolve(topLevelDirectory(), templatePath);

  return relative(topLevelDirectory(), gitMessagePath());
}

function gitMessagePath() {
  return process.env.GITMOB_MESSAGE_PATH || join(homedir(), '.gitmessage');
}

export { resolveGitMessagePath, setCommitTemplate };
