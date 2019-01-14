const fs = require('fs');
const os = require('os');
const path = require('path');
const { promisify } = require('util');

const gitCoauthorsPath =
  process.env.GITMOB_COAUTHORS_PATH || path.join(os.homedir(), '.git-coauthors');

function gitAuthors(readFilePromise, writeFilePromise) {
  async function readFile(path) {
    const readPromise = readFilePromise || promisify(fs.readFile);
    try {
      return await readPromise(path, 'utf8');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async function writeToFile(path, content) {
    const writeToPromise = writeFilePromise || promisify(fs.appendFile);
    try {
      return await writeToPromise(path, content, 'utf8');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return {
    read: async () => {
      const authorJsonString = await readFile(gitCoauthorsPath);
      try {
        return JSON.parse(authorJsonString);
      } catch (err) {
        throw new Error('Invalid JSON ' + err.message);
      }
    },

    write: async authorJson => {
      try {
        return writeToFile(gitCoauthorsPath, JSON.stringify(authorJson, null, 2));
      } catch (err) {
        throw new Error('Invalid JSON ' + err.message);
      }
    },

    fileExists: () => {
      return fs.existsSync(gitCoauthorsPath);
    },

    coAuthors(authorInitials, authorJson) {
      const { coauthors } = authorJson;
      return authorInitials.map(initials => {
        missingAuthorError(initials, coauthors);
        const { name, email } = coauthors[initials];
        return `${name} <${email}>`;
      });
    },

    toList(authors) {
      const entries = Object.entries(authors.coauthors);
      return entries.map(authorParts => {
        const [initials, { name, email }] = authorParts;
        return [initials, name, email].join(' ');
      });
    },
  };
}

function missingAuthorError(initials, coauthors) {
  if (!(initials in coauthors)) {
    throw new Error(`Author with initials "${initials}" not found!`);
  }
}

module.exports = { gitAuthors, gitCoauthorsPath };
