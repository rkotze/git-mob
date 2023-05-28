import { getConfig } from './exec-command';

export async function getLocalCommitTemplate() {
  return getConfig('--local commit.template');
}

export async function getGlobalCommitTemplate() {
  return getConfig('--global commit.template');
}
