import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { Author } from '../author.js';
import { topLevelDirectory } from '../git-rev-parse.js';

export type CoAuthorSchema = {
  coauthors: Record<string, { name: string; email: string }>;
};

export function gitAuthors(
  readFilePromise?: () => Promise<string>,
  overwriteFilePromise?: () => Promise<void>
) {
  return {
    read: async (path?: string) => {
      const readPromise = readFilePromise || promisify(fs.readFile);
      const authorJsonString = (await readPromise(
        path || (await pathToCoAuthors())
      )) as string;
      return JSON.parse(authorJsonString) as CoAuthorSchema;
    },

    overwrite: async (authorJson: CoAuthorSchema, path?: string) => {
      const overwritePromise = overwriteFilePromise || promisify(fs.writeFile);
      return overwritePromise(
        path || (await pathToCoAuthors()),
        JSON.stringify(authorJson, null, 2)
      );
    },

    toList(authors: CoAuthorSchema) {
      const entries = Object.entries(authors.coauthors);
      return entries.map(([key, { name, email }]) => new Author(key, name, email));
    },

    toObject(authorList: Author[]): CoAuthorSchema {
      const authorObject: CoAuthorSchema = {
        coauthors: {},
      };

      for (const author of authorList) {
        authorObject.coauthors[author.key] = {
          name: author.name,
          email: author.email,
        };
      }

      return authorObject;
    },
  };
}

export const gitCoauthorsFileName = '.git-coauthors';

export function globalGitCoAuthorsPath() {
  if (process.env.GITMOB_COAUTHORS_PATH) {
    return process.env.GITMOB_COAUTHORS_PATH;
  }

  return path.join(os.homedir(), gitCoauthorsFileName);
}

export async function pathToCoAuthors(): Promise<string> {
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
