import {
  buildAuthorList,
  buildCoAuthorObject,
  mockGitAuthors,
} from '../../test-helpers/author-mocks';
import { gitAuthors } from '../git-authors';
import { saveNewCoAuthors } from './add-new-coauthor';

jest.mock('../git-authors/index.js');
const mockedGitAuthors = jest.mocked(gitAuthors);

const coAuthorKeys: string[] = ['joe', 'rich'];

test('Save multiple new authors', async () => {
  const newAuthorKeys = ['fred', 'dim'];
  const newAuthors = buildAuthorList(newAuthorKeys);
  const mockGitAuthorsObject = mockGitAuthors(coAuthorKeys);
  mockedGitAuthors.mockReturnValue(mockGitAuthorsObject);

  const savedAuthors = await saveNewCoAuthors(newAuthors);
  expect(mockGitAuthorsObject.overwrite).toHaveBeenCalledTimes(1);
  expect(mockGitAuthorsObject.overwrite).toHaveBeenCalledWith(
    buildCoAuthorObject([...coAuthorKeys, ...newAuthorKeys])
  );
  expect(savedAuthors).toEqual(newAuthors);
});

test('Duplicated error when saving multiple new authors', async () => {
  const newAuthorKeys = ['joe', 'dim'];
  const newAuthors = buildAuthorList(newAuthorKeys);
  const mockGitAuthorsObject = mockGitAuthors(coAuthorKeys);
  mockedGitAuthors.mockReturnValue(mockGitAuthorsObject);

  await expect(saveNewCoAuthors(newAuthors)).rejects.toThrow(
    expect.objectContaining({
      message: expect.stringMatching(
        'Duplicate key joe exists in .git-coauthors'
      ) as string,
    }) as Error
  );
  expect(mockGitAuthorsObject.overwrite).not.toHaveBeenCalled();
});
