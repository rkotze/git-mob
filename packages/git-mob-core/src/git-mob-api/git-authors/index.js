import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { Author } from '../author.js';
import { topLevelDirectory } from '../git-rev-parse.js';

export function gitAuthors(readFilePromise, writeFilePromise, overwriteFilePromise) {
  async function readFile(path) {
    const readPromise = readFilePromise || promisify(fs.readFile);
    try {
      return await readPromise(path, 'utf8');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async function writeToFile(path, content) {
    const writeToPromise = writeFilePromise || promisify(fs.appendFile);
    try {
      return await writeToPromise(path, content, 'utf8');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async function overwriteFile(path, content) {
    const overwritePromise = overwriteFilePromise || promisify(fs.writeFile);
    try {
      return await overwritePromise(path, content, 'utf8');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  return {
    read: async () => {
      const authorJsonString = await readFile(await pathToCoAuthors());
      try {
        return JSON.parse(authorJsonString);
      } catch (error) {
        throw new Error('Invalid JSON ' + error.message);
      }
    },

    write: async authorJson => {
      try {
        return writeToFile(
          await pathToCoAuthors(),
          JSON.stringify(authorJson, null, 2)
        );
      } catch (error) {
        throw new Error('Invalid JSON ' + error.message);
      }
    },

    overwrite: async authorJson => {
      try {
        return overwriteFile(
          await pathToCoAuthors(),
          JSON.stringify(authorJson, null, 2)
        );
      } catch (error) {
        throw new Error('Invalid JSON ' + error.message);
      }
    },

    author(authorInitials, authorJson) {
      const { coauthors } = authorJson;
      missingAuthorError(authorInitials, coauthors);
      return coauthors[authorInitials];
    },

    toList(authors) {
      const entries = Object.entries(authors.coauthors);
      return entries.map(([key, { name, email }]) => new Author(key, name, email));
    },

    toObject(authorList) {
      const authorObject = {
        coauthors: {},
      };

      for (const author of authorList) {
        authorObject[author.key] = {
          name: author.name,
          email: author.email,
        };
      }

      return authorObject;
    },
  };
}

function missingAuthorError(initials, coauthors) {
  if (!(initials in coauthors)) {
    throw new Error(`Author with initials "${initials}" not found!`);
  }
}

export const gitCoauthorsFileName = '.git-coauthors';

export function globalGitCoAuthorsPath() {
  return path.join(os.homedir(), gitCoauthorsFileName);
}

export async function pathToCoAuthors() {
  if (process.env.GITMOB_COAUTHORS_PATH) {
    return process.env.GITMOB_COAUTHORS_PATH;
  }

  let repoAuthorsFile = null;

  try {
    repoAuthorsFile = path.join(await topLevelDirectory(), gitCoauthorsFileName);
  } catch {
    repoAuthorsFile = '';
  }

  return fs.existsSync(repoAuthorsFile) ? repoAuthorsFile : globalGitCoAuthorsPath();
}
