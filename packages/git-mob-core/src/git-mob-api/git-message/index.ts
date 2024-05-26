import { readFile, writeFile } from 'node:fs';
import { EOL } from 'node:os';
import { type Author } from '../author';

function fileExists(error: NodeJS.ErrnoException) {
  return error.code !== 'ENOENT';
}

async function append(messagePath: string, newAuthors: string): Promise<void> {
  return new Promise((resolve, reject) => {
    readFile(messagePath, 'utf8', (error, data) => {
      if (error && fileExists(error)) reject(error);

      let result = newAuthors;
      if (data) {
        result = data.replace(/(\r\n|\r|\n){1,2}Co-authored-by.*/g, '') + newAuthors;
      }

      writeFile(messagePath, result, error => {
        if (error) reject(error);

        resolve();
      });
    });
  });
}

async function read(messagePath: string) {
  return new Promise((resolve, reject) => {
    readFile(messagePath, 'utf8', (error, data) => {
      if (error && fileExists(error)) reject(error);

      resolve(data);
    });
  });
}

function formatCoAuthorList(coAuthorList: Author[]): string {
  return coAuthorList.map(coAuthor => coAuthor.format()).join(EOL);
}

function gitMessage(
  messagePath: string,
  appendFilePromise?: () => Promise<void>,
  readFilePromise?: () => Promise<string>
) {
  const appendPromise = appendFilePromise || append;
  const readPromise = readFilePromise || read;

  return {
    writeCoAuthors: async (coAuthorList: Author[]) => {
      const coAuthorText = formatCoAuthorList(coAuthorList);

      await appendPromise(messagePath, EOL + EOL + coAuthorText);
    },
    readCoAuthors: async () => {
      return readPromise(messagePath);
    },
    removeCoAuthors: async () => {
      return appendPromise(messagePath, '');
    },
  };
}

export { gitMessage };
