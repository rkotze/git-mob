import type { Author } from 'git-mob-core';
import { fetchGitHubAuthors } from 'git-mob-core';
import { saveAuthorList } from '../manage-authors/add-coauthor';
import { authorBaseFormat } from './author-base-format';

async function composeAuthors(
  initials: string[],
  coAuthorList: AuthorList,
  getAuthors = fetchGitHubAuthors,
  saveAuthors = saveAuthorList
): Promise<string[]> {
  const missing = findMissingAuthors(initials, coAuthorList);
  if (missing.length > 0) {
    const fetchedAuthors = await getAuthors(missing, 'git-mob-cli');
    const gitMobList = {
      coauthors: { ...coAuthorList, ...transformToAuthorList(fetchedAuthors) },
    };
    await saveAuthors(gitMobList);
    return buildFormatAuthorList(initials, gitMobList.coauthors);
  }

  return buildFormatAuthorList(initials, coAuthorList);
}

function findMissingAuthors(
  initialList: string[],
  coAuthorList: AuthorList
): string[] {
  return initialList.filter(initials => !containsAuthor(initials, coAuthorList));
}

function containsAuthor(initials: string, coauthors: AuthorList): boolean {
  return initials in coauthors;
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
  coAuthorList: AuthorList
): string[] {
  return initialsList.map(initials => {
    if (!containsAuthor(initials, coAuthorList)) {
      noAuthorFoundError(initials);
    }

    return authorBaseFormat(coAuthorList[initials]);
  });
}

function noAuthorFoundError(initials: string): Error {
  return new Error(`Author with initials "${initials}" not found!`);
}

export { findMissingAuthors, composeAuthors };
