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

function parseToString(author) {
  return [author.key, author.name, author.email].join(',');
}

// authorString: key, author name, auhtor@email.com
function parseToAuthor(authorString) {
  return new Author(...authorString.split(','));
}

module.exports = {
  Author,
  parseToAuthor,
  parseToString,
};
