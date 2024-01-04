import { getConfig } from './exec-command.js';

export async function getLocalCommitTemplate() {
  return getConfig('--local commit.template');
}

export async function getGlobalCommitTemplate() {
  return getConfig('--global commit.template');
}

export async function getGitUserName() {
  return getConfig('user.name');
}

export async function getGitUserEmail() {
  return getConfig('user.email');
}
