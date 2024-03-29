import { Author } from '../author.js';
import { gitAuthors } from '../git-authors/index.js';

export async function saveNewCoAuthors(authors: Author[]): Promise<Author[]> {
  if (!Array.isArray(authors)) {
    throw new TypeError('saveNewCoAuthors argument should be an Array of Authors');
  }

  const coauthors = gitAuthors();
  const authorList = await coauthors.read();
  const newAuthors = [];

  for (const author of authors) {
    const { key, name, email } = author;
    if (key in authorList.coauthors) {
      throw new Error(`Duplicate key ${key} exists in .git-coauthors`);
    } else {
      authorList.coauthors[key] = { name, email };
      newAuthors.push(new Author(key, name, email));
    }
  }

  await coauthors.overwrite(authorList);
  return newAuthors;
}
