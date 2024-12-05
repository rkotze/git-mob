import { AuthorTrailers } from './git-message/message-formatter';

export class Author {
  key: string;
  name: string;
  email: string;
  trailer: AuthorTrailers;

  constructor(
    key: string,
    name: string,
    email: string,
    trailer: AuthorTrailers = AuthorTrailers.CoAuthorBy
  ) {
    this.key = key;
    this.name = name;
    this.email = email;
    this.trailer = trailer;
  }

  format() {
    return `${this.trailer} ${this.toString()}`;
  }

  toString() {
    return `${this.name} <${this.email}>`;
  }
}
