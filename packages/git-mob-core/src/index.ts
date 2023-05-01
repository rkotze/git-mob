import { mob, config } from './commands';
import { Author } from './git-mob-api/author';
import { AuthorNotFound } from './git-mob-api/errors/author-not-found';
import { gitAuthors } from './git-mob-api/git-authors';
import { gitMessage } from './git-mob-api/git-message';
import { fetchFromGitHub, localTemplate } from './git-mob-api/git-mob-config';
import {
  resolveGitMessagePath,
  setCommitTemplate,
} from './git-mob-api/resolve-git-message-path';

async function getAllAuthors() {
  const gitMobAuthors = gitAuthors();
  return gitMobAuthors.toList(await gitMobAuthors.read());
}

async function setCoAuthors(keys: string[]) {
  const selectedAuthors = pickSelectedAuthors(keys, await getAllAuthors());
  await solo();

  for (const author of selectedAuthors) {
    mob.gitAddCoAuthor(author.toString());
  }

  await updateGitTemplate(selectedAuthors);
  return selectedAuthors;
}

async function updateGitTemplate(selectedAuthors?: Author[]) {
  const usingLocal = mob.usingLocalTemplate();
  const gitTemplate = gitMessage(
    resolveGitMessagePath(config.get('commit.template'))
  );

  if (selectedAuthors && selectedAuthors.length > 0) {
    if (usingLocal) {
      await gitMessage(mob.getGlobalTemplate()).writeCoAuthors(selectedAuthors);
    }

    return gitTemplate.writeCoAuthors(selectedAuthors);
  }

  if (usingLocal) {
    await gitMessage(mob.getGlobalTemplate()).removeCoAuthors();
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
  setCommitTemplate();
  mob.removeGitMobSection();
  return updateGitTemplate();
}

function getPrimaryAuthor() {
  const name = config.get('user.name') as string;
  const email = config.get('user.email') as string;

  if (name && email) {
    return new Author('prime', name, email);
  }

  return null;
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

const gitMobConfig = {
  localTemplate,
  fetchFromGitHub,
};

export { gitMobConfig };

export { saveNewCoAuthors } from './git-mob-api/manage-authors/add-new-coauthor';
export { pathToCoAuthors } from './git-mob-api/git-authors';
export { fetchGitHubAuthors } from './git-mob-api/git-authors/fetch-github-authors';
export { Author } from './git-mob-api/author';
