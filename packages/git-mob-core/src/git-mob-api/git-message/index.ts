import { readFile, writeFile } from 'node:fs/promises';
import { EOL } from 'node:os';
import { type Author } from '../author';

function fileExists(error: NodeJS.ErrnoException) {
  return error.code !== 'ENOENT';
}

async function append(messagePath: string, newAuthors: string): Promise<void> {
  const data = await read(messagePath);

  let result = newAuthors;
  if (data) {
    result = data.replaceAll(/(\r\n|\r|\n){1,2}Co-authored-by.*/g, '') + newAuthors;
  }

  await writeFile(messagePath, result);
}

async function read(messagePath: string) {
  try {
    return await readFile(messagePath, { encoding: 'utf8' });
  } catch (error: unknown) {
    if (error && fileExists(error as Error)) {
      throw error as Error;
    }
  }
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
