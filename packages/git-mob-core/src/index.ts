import { mob, config } from './commands.js';
import { Author } from './git-mob-api/author.js';
import { AuthorNotFound } from './git-mob-api/errors/author-not-found.js';
import { gitAuthors } from './git-mob-api/git-authors/index.js';
import { gitMessage } from './git-mob-api/git-message/index.js';
import {
  localTemplate,
  fetchFromGitHub,
  getSetCoAuthors,
} from './git-mob-api/git-mob-config.js';
import {
  getLocalCommitTemplate,
  getGlobalCommitTemplate,
} from './git-mob-api/git-config.js';
import {
  resolveGitMessagePath,
  setCommitTemplate,
} from './git-mob-api/resolve-git-message-path.js';
import { insideWorkTree, topLevelDirectory } from './git-mob-api/git-rev-parse.js';
import { getConfig } from './git-mob-api/exec-command.js';

async function getAllAuthors() {
  const gitMobAuthors = gitAuthors();
  return gitMobAuthors.toList(await gitMobAuthors.read());
}

async function setCoAuthors(keys: string[]): Promise<Author[]> {
  const selectedAuthors = pickSelectedAuthors(keys, await getAllAuthors());
  await solo();

  for (const author of selectedAuthors) {
    mob.gitAddCoAuthor(author.toString());
  }

  await updateGitTemplate(selectedAuthors);
  return selectedAuthors;
}

async function updateGitTemplate(selectedAuthors?: Author[]) {
  const [usingLocal, templatePath] = await Promise.all([
    getLocalCommitTemplate(),
    getConfig('commit.template'),
  ]);

  const gitTemplate = gitMessage(await resolveGitMessagePath(templatePath));

  if (selectedAuthors && selectedAuthors.length > 0) {
    if (usingLocal) {
      await gitMessage(await getGlobalCommitTemplate()).writeCoAuthors(
        selectedAuthors
      );
    }

    return gitTemplate.writeCoAuthors(selectedAuthors);
  }

  if (usingLocal) {
    await gitMessage(await getGlobalCommitTemplate()).removeCoAuthors();
  }

  return gitTemplate.removeCoAuthors();
}

function pickSelectedAuthors(keys: string[], authorMap: Author[]): Author[] {
  const selectedAuthors = [];
  for (const key of keys) {
    const author = authorMap.find(author => author.key === key);

    if (!author) throw new AuthorNotFound(key);
    selectedAuthors.push(author);
  }

  return selectedAuthors;
}

function getSelectedCoAuthors(allAuthors: Author[]) {
  let coAuthorsString = '';
  const coauthorKey = '--global git-mob.co-author';
  if (config.has(coauthorKey)) {
    coAuthorsString = config.getAll(coauthorKey) as string;
  }

  return allAuthors.filter(author => coAuthorsString.includes(author.email));
}

async function solo() {
  await setCommitTemplate();
  mob.removeGitMobSection();
  return updateGitTemplate();
}

function getPrimaryAuthor() {
  const name = config.get('user.name') as string;
  const email = config.get('user.email') as string;

  if (name && email) {
    return new Author('prime', name, email);
  }
}

function setPrimaryAuthor(author: Author): void {
  if (author) {
    config.set('user.name', author.name);
    config.set('user.email', author.email);
  }
}

export {
  getAllAuthors,
  getPrimaryAuthor,
  getSelectedCoAuthors,
  setCoAuthors,
  setPrimaryAuthor,
  solo,
  updateGitTemplate,
};

export const gitMobConfig = {
  localTemplate,
  fetchFromGitHub,
  getSetCoAuthors,
};

export const gitConfig = {
  getLocalCommitTemplate,
  getGlobalCommitTemplate,
};

export const gitRevParse = {
  insideWorkTree,
  topLevelDirectory,
};

export { saveNewCoAuthors } from './git-mob-api/manage-authors/add-new-coauthor.js';
export { repoAuthorList } from './git-mob-api/git-authors/repo-author-list.js';
export { pathToCoAuthors } from './git-mob-api/git-authors/index.js';
export { fetchGitHubAuthors } from './git-mob-api/git-authors/fetch-github-authors.js';
export { getConfig, updateConfig } from './config-manager.js';
export { Author } from './git-mob-api/author.js';
