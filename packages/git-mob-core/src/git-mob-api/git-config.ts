import { getConfig, setConfig } from './exec-command.js';

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

export async function setGitUserName(name: string) {
  return setConfig('user.name', name);
}

export async function setGitUserEmail(email: string) {
  return setConfig('user.email', email);
}
