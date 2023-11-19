import { EOL } from 'node:os';
import { Author } from '../author';
import { getRepoAuthors } from '../exec-command';

export async function repoAuthorList(
  authorFilter?: string
): Promise<Author[] | undefined> {
  const repoAuthorsString = await getRepoAuthors(authorFilter);
  const splitEndOfLine = repoAuthorsString.split(EOL);
  const authorList = splitEndOfLine
    .map(createRepoAuthor)
    .filter(author => author !== undefined) as Author[];

  if (authorList.length > 0) return authorList;
}

function createRepoAuthor(authorString: string) {
  const regexList = /\d+\t(.+)\s<(.+)>/;
  const authorArray = regexList.exec(authorString);
  if (authorArray !== null) {
    const [, name, email] = authorArray;
    return new Author(genKey(name, email), name, email);
  }
}

function genKey(name: string, email: string) {
  const nameInitials = name
    .toLowerCase()
    .split(' ')
    .reduce(function (acc, cur) {
      return acc + cur[0];
    }, '');

  const domainFirstTwoLetters = email.slice(0, 2);
  return nameInitials + domainFirstTwoLetters;
}
