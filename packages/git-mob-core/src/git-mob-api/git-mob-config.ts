import { getConfig, getAllConfig, execCommand } from './exec-command.js';
import { configScopeFlag } from './config-scope.js';

export async function localTemplate() {
  const localTemplate = await getConfig('--local git-mob-config.use-local-template');
  return localTemplate === 'true';
}

export async function fetchFromGitHub() {
  const scope = configScopeFlag();
  const githubFetch = await getConfig(`${scope} git-mob-config.github-fetch`);
  return githubFetch === 'true';
}

export async function getSetCoAuthors() {
  const scope = configScopeFlag();
  return getAllConfig(`${scope} git-mob.co-author`);
}

export async function addCoAuthor(coAuthor: string) {
  const scope = configScopeFlag();
  const addAuthorQuery = `git config --add ${scope} git-mob.co-author "${coAuthor}"`;

  return execCommand(addAuthorQuery);
}

export async function removeGitMobSection() {
  try {
    const scope = configScopeFlag();
    return await execCommand(`git config ${scope} --remove-section git-mob`);
  } catch {}
}
