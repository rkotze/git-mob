import { existsSync } from 'node:fs';
import { mockGitAuthors as mockGitAuthorsFn } from '../../test-helpers/author-mocks';
import { createCoAuthorsFile } from './create-coauthors-file';
import { gitAuthors } from '.';

jest.mock('node:fs');
jest.mock('.');

const mockExistsSync = jest.mocked(existsSync);
const mockGitAuthors = jest.mocked(gitAuthors);

test('Throw error if coauthor file exists', async () => {
  mockExistsSync.mockReturnValueOnce(true);

  await expect(createCoAuthorsFile()).rejects.toThrow(
    expect.objectContaining({
      message: expect.stringMatching(
        '.git-coauthors file exists globally'
      ) as string,
    }) as Error
  );
});

test('Save coauthor file in home directory', async () => {
  mockExistsSync.mockReturnValueOnce(false);
  const mockGitAuthorsObject = mockGitAuthorsFn(['jo', 'hu']);
  mockGitAuthors.mockReturnValue(mockGitAuthorsObject);

  await expect(createCoAuthorsFile()).resolves.toEqual(true);
  expect(mockGitAuthorsObject.write).toHaveBeenCalled();
});
