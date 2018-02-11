const fs = require('fs');
const os = require('os');
const path = require('path');
const { promisify } = require('util');
const yaml = require('js-yaml');

function gitAuthors(readFilePromise) {
  const readPromise = readFilePromise || promisify(fs.readFile);
  async function readFile(path) {
    try {
      return await readPromise(path, 'utf8');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return {
    read: async () => {
      const gitAuthorsPath = process.env.TEST
        ? path.join('test-helpers', '.git-authors')
        : path.join(os.homedir(), '.git-authors');
      const authorYaml = await readFile(gitAuthorsPath);
      return yaml.load(authorYaml);
    },

    coAuthors(authorInitials, authorJson) {
      const authors = authorJson.authors;
      const emailDomain = authorJson.email.domain;
      return authorInitials.map(initials => {
        missingAuthorError(initials, authors);
        const author = authors[initials].split('; ');
        const formatName =
          author[1] || author[0].replace(' ', '-').toLowerCase();
        return `${author[0]} <${formatName}@${emailDomain}>`;
      });
    },
  };
}

function missingAuthorError(initials, authors) {
  if (!(initials in authors)) {
    throw new Error(`Author with initials "${initials}" not found!`);
  }
}

module.exports = { gitAuthors };
