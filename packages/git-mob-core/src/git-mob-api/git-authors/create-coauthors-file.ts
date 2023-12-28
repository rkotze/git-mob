import { existsSync } from 'node:fs';
import { type Author } from '../author';
import { gitAuthors, gitCoauthorsFileName, globalGitCoAuthorsPath } from './index';

const coAuthorSchema = {
  coauthors: {
    hh: {
      name: 'Hulk Hogan',
      email: 'hulk_hogan22@hotmail.org',
    },
  },
};

export async function createCoAuthorsFile(authorList: Author[]): Promise<boolean> {
  const authorOps = gitAuthors();
  const coAuthorFilePath: string = globalGitCoAuthorsPath();
  if (existsSync(coAuthorFilePath)) {
    throw new Error(`${gitCoauthorsFileName} file exists globally`);
  }

  if (authorList && authorList.length > 0) {
    const schema = authorOps.toObject(authorList) as Record<
      string,
      Record<string, { name: string; email: string }>
    >;
    await authorOps.overwrite(schema);
  } else {
    await authorOps.overwrite(coAuthorSchema);
  }

  return true;
}
