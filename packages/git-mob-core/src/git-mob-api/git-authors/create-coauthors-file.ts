import { existsSync } from 'node:fs';
import { gitAuthors, gitCoauthorsFileName, globalGitCoAuthorsPath } from './index';

const coAuthorSchema = {
  coauthors: {
    hh: {
      name: 'Hulk Hogan',
      email: 'hulk_hogan22@hotmail.org',
    },
  },
};

export async function createCoAuthorsFile(): Promise<boolean> {
  const authorOps = gitAuthors();
  const coAuthorFilePath: string = globalGitCoAuthorsPath();
  if (existsSync(coAuthorFilePath)) {
    throw new Error(`${gitCoauthorsFileName} file exists globally`);
  }

  await authorOps.write(coAuthorSchema);
  return true;
}
