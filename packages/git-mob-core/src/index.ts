import { mob, config } from './commands';
import { Author } from './git-mob-api/author';
import { gitAuthors } from './git-mob-api/git-authors';
import { gitMessage } from './git-mob-api/git-message';
import {
  resolveGitMessagePath,
  setCommitTemplate,
} from './git-mob-api/resolve-git-message-path';

async function getAllAuthors() {
  const gitMobAuthors = gitAuthors();
  return gitMobAuthors.toList(await gitMobAuthors.read());
}

async function setCoAuthors(keys: string[]) {
  await solo();
  const selectedAuthors = pickSelectedAuthors(keys, await getAllAuthors());
  for (const author of selectedAuthors) {
    mob.gitAddCoAuthor(author.toString());
  }

  await updateGitTemplate(selectedAuthors);
  return selectedAuthors;
}

async function updateGitTemplate(selectedAuthors?: Author[]) {
  const gitTemplate = gitMessage(
    resolveGitMessagePath(config.get('commit.template'))
  );
  if (selectedAuthors && selectedAuthors.length > 0) {
    return gitTemplate.writeCoAuthors(selectedAuthors);
  }

  return gitTemplate.removeCoAuthors();
}

function pickSelectedAuthors(keys: string[], authorMap: Author[]): Author[] {
  return authorMap.filter(author => keys.includes(author.key));
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

export { saveNewCoAuthors } from './git-mob-api/manage-authors/add-new-coauthor';
export { fetchGitHubAuthors } from './git-mob-api/git-authors/fetch-github-authors';
export { Author } from './git-mob-api/author';
