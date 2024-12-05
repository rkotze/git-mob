import { readFile, writeFile } from 'node:fs/promises';
import { type Author } from '../author';
import { messageFormatter } from './message-formatter';

function fileExists(error: NodeJS.ErrnoException) {
  return error.code !== 'ENOENT';
}

async function append(messagePath: string, newAuthors: Author[]): Promise<void> {
  const data = await read(messagePath);

  const result = messageFormatter(data || '', newAuthors);

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

function gitMessage(
  messagePath: string,
  appendFilePromise?: () => Promise<void>,
  readFilePromise?: () => Promise<string>
) {
  const appendPromise = appendFilePromise || append;
  const readPromise = readFilePromise || read;

  return {
    writeCoAuthors: async (coAuthorList: Author[]) => {
      await appendPromise(messagePath, coAuthorList);
    },
    readCoAuthors: async () => {
      return readPromise(messagePath);
    },
    removeCoAuthors: async () => {
      return appendPromise(messagePath, []);
    },
  };
}

export { gitMessage };
