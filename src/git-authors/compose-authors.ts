import { fetchAuthors } from './fetch-authors';

type AuthorList = Record<string, Author>;

function composeAuthors(
  initials: string[],
  coAuthorList: AuthorList,
  getAuthors = fetchAuthors
) {
  // let coauthors: Author[] = [];
  const missing = findMissingAuthors(initials, coAuthorList);
  if (missing.length > 0) {
    getAuthors(missing);
  }
  //   coauthors.concat(searchGitHub())
  // }
  // coautors.concat(coAuthors(initials.filter(), authorList))
}

function findMissingAuthors(
  initialList: string[],
  coAuthorList: AuthorList
): string[] {
  return initialList.filter(initials => missingAuthor(initials, coAuthorList));
}

function authorBaseFormat({ name, email }: Author): string {
  return `${name} <${email}>`;
}

function missingAuthor(initials: string, coauthors: AuthorList): boolean {
  return !(initials in coauthors);
}

// function noAuthorFoundError(initials: string): Error {
//   return new Error(`Author with initials "${initials}" not found!`);
// }

export { authorBaseFormat, findMissingAuthors, composeAuthors };
