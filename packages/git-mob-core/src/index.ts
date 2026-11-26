import { EOL } from 'node:os';
import { Author } from './git-mob-api/author.js';
import { AuthorNotFound } from './git-mob-api/errors/author-not-found.js';
import { gitAuthors } from './git-mob-api/git-authors/index.js';
import { gitMessage } from './git-mob-api/git-message/index.js';
import {
  localTemplate,
  fetchFromGitHub,
  getSetCoAuthors,
  addCoAuthor,
  removeGitMobSection,
} from './git-mob-api/git-mob-config.js';
import {
  getLocalCommitTemplate,
  getGlobalCommitTemplate,
  getGitUserName,
  getGitUserEmail,
  setGitUserName,
  setGitUserEmail,
} from './git-mob-api/git-config.js';
import {
  resolveGitMessagePath,
  setCommitTemplate,
} from './git-mob-api/resolve-git-message-path.js';
import { insideWorkTree, topLevelDirectory } from './git-mob-api/git-rev-parse.js';
import { getConfig } from './git-mob-api/exec-command.js';
import { AuthorTrailers } from './git-mob-api/git-message/message-formatter.js';

async function getAllAuthors() {
  const gitMobAuthors = gitAuthors();
  return gitMobAuthors.toList(await gitMobAuthors.read());
}

async function setCoAuthors(keys: string[]): Promise<Author[]> {
  const selectedAuthors = pickSelectedAuthors(keys, await getAllAuthors());
  await solo();

  for (const author of selectedAuthors) {
    // eslint-disable-next-line no-await-in-loop
    await addCoAuthor(author.toString());
  }

  await updateGitTemplate(selectedAuthors);
  return selectedAuthors;
}

async function setSelectedAuthors(
  keysTrailers: Array<[string, AuthorTrailers]>
): Promise<Author[]> {
  const allAuthors = await getAllAuthors();
  const selectedAuthors = keysTrailers.map(([key, trailer]) => {
    const author = allAuthors.find(author => author.key === key);
    if (!author) throw new AuthorNotFound(key);
    author.trailer = trailer;
    return author;
  });

  await solo();

  for (const author of selectedAuthors) {
    // eslint-disable-next-line no-await-in-loop
    await addCoAuthor(author.toString(), author.trailer);
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

function convertToAuthorTrailers(value: string): AuthorTrailers | undefined {
  if (value === 'co-author') return AuthorTrailers.CoAuthorBy;

  return (Object.values(AuthorTrailers) as string[]).includes(value)
    ? (value as AuthorTrailers)
    : undefined;
}

async function getSelectedCoAuthors(allAuthors: Author[]) {
  const coAuthorsString = (await getSetCoAuthors()) ?? '';

  return coAuthorsString
    .split(EOL)
    .map(line => {
      const [key, ...rest] = line.split(' ');
      const authorString = rest.join(' ');

      const trailer = convertToAuthorTrailers(key.split('.')[1]);
      if (!trailer) return null;

      const author = allAuthors.find(author =>
        authorString.includes('<' + author.email)
      );
      if (!author) return null;

      author.trailer = trailer;
      return author;
    })
    .filter(author => author !== null);
}

async function solo() {
  await setCommitTemplate();
  await removeGitMobSection();
  return updateGitTemplate();
}

async function getPrimaryAuthor() {
  const name = await getGitUserName();
  const email = await getGitUserEmail();

  if (name && email) {
    return new Author('prime', name, email);
  }
}

async function setPrimaryAuthor(author: Author) {
  await setGitUserName(author.name);
  await setGitUserEmail(author.email);
}

export {
  getAllAuthors,
  getPrimaryAuthor,
  getSelectedCoAuthors,
  setCoAuthors,
  setSelectedAuthors,
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
export { createCoAuthorsFile } from './git-mob-api/git-authors/create-coauthors-file.js';
export { repoAuthorList } from './git-mob-api/git-authors/repo-author-list.js';
export { pathToCoAuthors } from './git-mob-api/git-authors/index.js';
export {
  fetchGitHubAuthors,
  searchGitHubAuthors,
} from './git-mob-api/git-authors/fetch-github-authors.js';
export { getConfig, updateConfig } from './config-manager.js';
export { Author } from './git-mob-api/author.js';
export {
  messageFormatter,
  AuthorTrailers,
} from './git-mob-api/git-message/message-formatter.js';
