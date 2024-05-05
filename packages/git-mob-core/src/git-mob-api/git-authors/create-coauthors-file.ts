import { existsSync } from 'node:fs';
import { type Author } from '../author';
import { gitAuthors, gitCoauthorsFileName, globalGitCoAuthorsPath } from './index';

const coAuthorSchema = {
  coauthors: {
    pa: {
      name: 'Placeholder Author',
      email: 'placeholder@author.org',
    },
  },
};

export async function createCoAuthorsFile(authorList?: Author[]): Promise<boolean> {
  const authorOps = gitAuthors();
  const coAuthorFilePath: string = globalGitCoAuthorsPath();
  if (existsSync(coAuthorFilePath)) {
    throw new Error(`${gitCoauthorsFileName} file exists globally`);
  }

  if (authorList && authorList.length > 0) {
    const schema = authorOps.toObject(authorList);
    await authorOps.overwrite(schema, coAuthorFilePath);
  } else {
    await authorOps.overwrite(coAuthorSchema, coAuthorFilePath);
  }

  return true;
}
