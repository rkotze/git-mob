import { saveAuthorList } from '../manage-authors/add-coauthor';
import { authorBaseFormat } from './author-base-format';
import { fetchAuthors } from './fetch-authors';

async function composeAuthors(
  initials: string[],
  coAuthorList: AuthorList,
  getAuthors = fetchAuthors,
  saveAuthors = saveAuthorList
): Promise<string[]> {
  const missing = findMissingAuthors(initials, coAuthorList);
  if (missing.length > 0) {
    const fetchedAuthors = await getAuthors(missing);
    const gitMobList = { coauthors: { ...coAuthorList, ...fetchedAuthors } };
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
