// import { mockCoAuthorObject, mockGitAuthors } from '../../test-helpers/author-mocks';
import { Author } from '../author';
import { gitAuthors } from '../git-authors';
import { saveNewCoAuthors } from './add-new-coauthor';

function mockAuthorList(keys: string[]) {
  return keys.map(key => new Author(key, key + ' lastName', key + '@email.com'));
}

function mockCoAuthorObject(keys: string[]) {
  const authorList = mockAuthorList(keys);
  const coAuthorList: Record<
    string,
    Record<string, { name: string; email: string }>
  > = { coauthors: {} };

  for (const author of authorList) {
    coAuthorList.coauthors[author.key] = { name: author.name, email: author.email };
  }

  return coAuthorList;
}

function mockGitAuthors(keys: string[]) {
  const authors = mockAuthorList(keys);
  const coAuthors = mockCoAuthorObject(keys);
  return {
    read: jest.fn(async () => coAuthors),
    write: jest.fn(async () => ''),
    overwrite: jest.fn(async () => ''),
    fileExists: jest.fn(() => true),
    coAuthors: jest.fn(() => []),
    author: jest.fn(() => ({})),
    coAuthorsInitials: jest.fn(() => []),
    toList: jest.fn(() => authors),
  };
}

jest.mock('../git-authors/index.js');
const mockedGitAuthors = jest.mocked(gitAuthors);

const coAuthorKeys: string[] = ['joe', 'rich'];
// const savedCoAuthors = mockCoAuthorObject(coAuthorKeys);

test('Save multiple new authors', async () => {
  const newAuthorKeys = ['fred', 'dim'];
  const newAuthors = mockAuthorList(newAuthorKeys);
  const mockGitAuthorsObject = mockGitAuthors(coAuthorKeys);
  mockedGitAuthors.mockReturnValue(mockGitAuthorsObject);

  const savedAuthors = await saveNewCoAuthors(newAuthors);
  expect(mockGitAuthorsObject.overwrite).toHaveBeenCalledTimes(1);
  expect(mockGitAuthorsObject.overwrite).toHaveBeenCalledWith(
    mockCoAuthorObject([...coAuthorKeys, ...newAuthorKeys])
  );
  expect(savedAuthors).toEqual(newAuthors);
});
