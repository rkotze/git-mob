const fs = require('fs');
const os = require('os');
const path = require('path');
const { promisify } = require('util');

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
        ? path.join('test-helpers', '.git-coauthors')
        : path.join(os.homedir(), '.git-coauthors');
      const authorJsonString = await readFile(gitAuthorsPath);
      try {
        return JSON.parse(authorJsonString);
      } catch (err) {
        throw new Error('Invalid JSON ' + err.message);
      }
    },

    coAuthors(authorInitials, authorJson) {
      const { coauthors } = authorJson;
      return authorInitials.map(initials => {
        missingAuthorError(initials, coauthors);
        const { name, email } = coauthors[initials];
        return `${name} <${email}>`;
      });
    },
  };
}

function missingAuthorError(initials, coauthors) {
  if (!(initials in coauthors)) {
    throw new Error(`Author with initials "${initials}" not found!`);
  }
}

module.exports = { gitAuthors };
