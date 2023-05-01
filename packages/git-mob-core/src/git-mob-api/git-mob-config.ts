import { execCommand } from './exec-command';

async function get(key: string) {
  return execCommand(`git config --get ${key}`);
}

export async function localTemplate() {
  const localTemplate = await get('--local git-mob-config.use-local-template');
  return localTemplate === 'true';
}

export async function fetchFromGitHub() {
  const githubFetch = await get('--global git-mob-config.github-fetch');
  return githubFetch === 'true';
}
