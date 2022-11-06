class Author {
  constructor(key, name, email) {
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

module.exports = {
  Author,
};
