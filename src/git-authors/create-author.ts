/* eslint-disable @typescript-eslint/object-curly-spacing */
type Author = {
  name: string;
  email: string;
};

function findMissingAuthors(): string[] {
  return [];
}

function authorBaseFormat({ name, email }: Author): string {
  return `${name} <${email}>`;
}

function missingAuthorError(initials: string, coauthors: Author[]): boolean {
  return !(initials in coauthors);
}

function noAuthorFound(initials): void {
  throw new Error(`Author with initials "${initials}" not found!`);
}

export { authorBaseFormat };
