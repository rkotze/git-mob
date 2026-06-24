import { Author } from '../git-mob-api/author';
import { CoAuthorSchema } from '../git-mob-api/git-authors';
import { AuthorTrailers } from '../git-mob-api/git-message/message-formatter';

export function buildAuthorList(
  keys: string[],
  trailers: AuthorTrailers[] = []
): Author[] {
  return keys.map(
    (key, i) =>
      new Author(
        key,
        key + ' lastName',
        key + '@email.com',
        trailers[i] || AuthorTrailers.CoAuthorBy
      )
  );
}

export function buildCoAuthorObject(keys: string[]): CoAuthorSchema {
  const authorList = buildAuthorList(keys);
  const coAuthorList: CoAuthorSchema = { coauthors: {} };

  for (const author of authorList) {
    coAuthorList.coauthors[author.key] = { name: author.name, email: author.email };
  }

  return coAuthorList;
}

export function mockGitAuthors(keys: string[], trailers: AuthorTrailers[] = []) {
  const authors = buildAuthorList(keys, trailers);
  const coAuthors = buildCoAuthorObject(keys);
  return {
    read: jest.fn(async () => coAuthors),
    overwrite: jest.fn(async () => ''),
    toList: jest.fn(() => authors),
    toObject: jest.fn(() => ({ coauthors: {} })),
  };
}
