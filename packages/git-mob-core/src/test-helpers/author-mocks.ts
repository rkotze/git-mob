import { Author } from '../git-mob-api/author';

export function buildAuthorList(keys: string[]): Author[] {
  return keys.map(key => new Author(key, key + ' lastName', key + '@email.com'));
}

export function buildCoAuthorObject(keys: string[]) {
  const authorList = buildAuthorList(keys);
  const coAuthorList: Record<
    string,
    Record<string, { name: string; email: string }>
  > = { coauthors: {} };

  for (const author of authorList) {
    coAuthorList.coauthors[author.key] = { name: author.name, email: author.email };
  }

  return coAuthorList;
}

export function mockGitAuthors(keys: string[]) {
  const authors = buildAuthorList(keys);
  const coAuthors = buildCoAuthorObject(keys);
  return {
    read: jest.fn(async () => coAuthors),
    overwrite: jest.fn(async () => ''),
    toList: jest.fn(() => authors),
    toObject: jest.fn(() => ({ coauthors: {} })),
  };
}
