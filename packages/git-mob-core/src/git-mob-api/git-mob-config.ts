import { getConfig } from './exec-command';

export async function localTemplate() {
  const localTemplate = await getConfig('--local git-mob-config.use-local-template');
  return localTemplate === 'true';
}

export async function fetchFromGitHub() {
  const githubFetch = await getConfig('--global git-mob-config.github-fetch');
  return githubFetch === 'true';
}
