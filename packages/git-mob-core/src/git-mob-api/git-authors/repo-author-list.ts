import { Author } from '../author';
import { getRepoAuthors } from '../exec-command';

export async function repoAuthorList(): Promise<Author[]> {
  const repoAuthorsString = await getRepoAuthors();
  const splitEndOfLine = repoAuthorsString.split('\n');
  return splitEndOfLine
    .map(createRepoAuthor)
    .filter(author => author instanceof Author);
}

function createRepoAuthor(authorString: string) {
  const regexList = /\s\d+\t(.+)\s<(.+)>/;
  const authorArray = authorString.match(regexList);
  if (authorArray !== null) {
    const [, name, email] = authorArray;
    return new Author(genKey(name, email), name, email);
  }

  return null;
}

function genKey(name: string, email: string) {
  const nameInitials = name
    .toLowerCase()
    .split(' ')
    .reduce(function (acc, cur) {
      return acc + cur[0];
    }, '');

  const domainFirstTwoLetters = email.split('@')[1].slice(0, 2);
  return nameInitials + domainFirstTwoLetters;
}
