import { getConfig, getAllConfig, execCommand } from './exec-command.js';

export async function localTemplate() {
  const localTemplate = await getConfig('--local git-mob-config.use-local-template');
  return localTemplate === 'true';
}

export async function fetchFromGitHub() {
  const githubFetch = await getConfig('--global git-mob-config.github-fetch');
  return githubFetch === 'true';
}

export async function getSetCoAuthors() {
  return getAllConfig('--global git-mob.co-author');
}

export async function addCoAuthor(coAuthor: string) {
  const addAuthorQuery = `git config --add --global git-mob.co-author "${coAuthor}"`;

  return execCommand(addAuthorQuery);
}

export async function removeGitMobSection() {
  try {
    return await execCommand('git config --global --remove-section git-mob');
  } catch {}
}
