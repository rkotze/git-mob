export class Author {
  key: string;
  name: string;
  email: string;

  constructor(key: string, name: string, email: string) {
    this.key = key;
    this.name = name;
    this.email = email;
  }

  format() {
    return `Co-authored-by: ${this.toString()}`;
  }

  toString() {
    return `${this.name} <${this.email}>`;
  }
}
