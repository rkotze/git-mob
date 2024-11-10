import { AuthorTrailers } from './git-message/message-formatter';

export class Author {
  key: string;
  name: string;
  email: string;

  constructor(key: string, name: string, email: string) {
    this.key = key;
    this.name = name;
    this.email = email;
  }

  format(trailer: AuthorTrailers = AuthorTrailers.CoAuthorBy) {
    return `${trailer} ${this.toString()}`;
  }

  toString() {
    return `${this.name} <${this.email}>`;
  }
}
