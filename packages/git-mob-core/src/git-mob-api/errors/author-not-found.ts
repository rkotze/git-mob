export class AuthorNotFound extends Error {
  constructor(initials: string) {
    super(`Author with initials "${initials}" not found!`);
  }
}
