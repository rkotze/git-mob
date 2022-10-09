type Author = {
  name: string;
  email: string;
};

type Authorlist = Record<string, Author>;

function findMissingAuthors(
  initialList: string[],
  coAuthorList: Authorlist
): string[] {
  return initialList.filter(initials => missingAuthor(initials, coAuthorList));
}

function authorBaseFormat({ name, email }: Author): string {
  return `${name} <${email}>`;
}

function missingAuthor(initials: string, coauthors: Authorlist): boolean {
  return !(initials in coauthors);
}

// function noAuthorFoundError(initials: string): Error {
//   return new Error(`Author with initials "${initials}" not found!`);
// }

export { authorBaseFormat, findMissingAuthors };
