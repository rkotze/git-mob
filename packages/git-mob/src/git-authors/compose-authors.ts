import type { Author } from 'git-mob-core';
import { fetchGitHubAuthors } from 'git-mob-core';
import { saveAuthorList } from '../manage-authors/add-coauthor';
import { mobConfig } from '../git-mob-commands';
import { authorBaseFormat } from './author-base-format';

// todo: CHANGE function name
// Only need to find & save missing authors
async function composeAuthors(
  initials: string[],
  coAuthorList: Author[],
  getAuthors = fetchGitHubAuthors,
  saveAuthors = saveAuthorList
): Promise<string[] | null> {
  if (!mobConfig.fetchFromGitHub()) {
    return null;
  }

  const missing = findMissingAuthors(initials, coAuthorList);
  if (missing.length > 0) {
    const fetchedAuthors = await getAuthors(missing, 'git-mob-cli');
    // use Author[] to save new authors git mob core saveNewCoAuthors() should do the trick
    const gitMobList = {
      coauthors: { ...coAuthorList, ...transformToAuthorList(fetchedAuthors) },
    };
    await saveAuthors(gitMobList);
  }
}

function findMissingAuthors(
  initialList: string[],
  coAuthorList: Author[]
): string[] {
  return initialList.filter(initials => !containsAuthor(initials, coAuthorList));
}

function containsAuthor(initials: string, coauthors: Author[]): boolean {
  return coauthors.some(author => author.key === initials);
}

function transformToAuthorList(authors: Author[]): AuthorList {
  const authorList: AuthorList = {};

  for (const author of authors) {
    authorList[author.key] = {
      name: author.name,
      email: author.email,
    };
  }

  return authorList;
}

function buildFormatAuthorList(
  initialsList: string[],
  coAuthorList: Author[]
): string[] {
  return initialsList.map(initials => {
    if (!containsAuthor(initials, coAuthorList)) {
      noAuthorFoundError(initials);
    }

    return authorBaseFormat(coAuthorList[initials]);
  });
}

function noAuthorFoundError(initials: string): Error {
  throw new Error(`Author with initials "${initials}" not found!`);
}

export { findMissingAuthors, composeAuthors };
