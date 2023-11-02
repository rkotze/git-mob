import { readFile as _readFile, appendFile, writeFile, existsSync } from 'node:fs';
import { promisify } from 'node:util';
import { pathToCoAuthors } from 'git-mob-core';
import { authorBaseFormat } from './author-base-format.js';

export function gitAuthors(readFilePromise, writeFilePromise, overwriteFilePromise) {
  async function readFile(path) {
    const readPromise = readFilePromise || promisify(_readFile);
    try {
      return await readPromise(path, 'utf8');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async function writeToFile(path, content) {
    const writeToPromise = writeFilePromise || promisify(appendFile);
    try {
      return await writeToPromise(path, content, 'utf8');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async function overwriteFile(path, content) {
    const overwritePromise = overwriteFilePromise || promisify(writeFile);
    try {
      return await overwritePromise(path, content, 'utf8');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  return {
    read: async () => {
      const authorJsonString = await readFile(pathToCoAuthors());
      try {
        return JSON.parse(authorJsonString);
      } catch (error) {
        throw new Error('Invalid JSON ' + error.message);
      }
    },

    write: async authorJson => {
      try {
        return writeToFile(pathToCoAuthors(), JSON.stringify(authorJson, null, 2));
      } catch (error) {
        throw new Error('Invalid JSON ' + error.message);
      }
    },

    overwrite: async authorJson => {
      try {
        return overwriteFile(pathToCoAuthors(), JSON.stringify(authorJson, null, 2));
      } catch (error) {
        throw new Error('Invalid JSON ' + error.message);
      }
    },

    fileExists: () => {
      return existsSync(pathToCoAuthors());
    },

    author(authorInitials, authorJson) {
      const { coauthors } = authorJson;
      missingAuthorError(authorInitials, coauthors);
      return coauthors[authorInitials];
    },

    coAuthorsInitials(authorJson, currentCoAuthors) {
      const { coauthors } = authorJson;
      return Object.keys(coauthors).reduce((currentCoAuthorsInitials, initials) => {
        if (currentCoAuthors.includes(authorBaseFormat(coauthors[initials]))) {
          currentCoAuthorsInitials.push(initials);
        }

        return currentCoAuthorsInitials;
      }, []);
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
