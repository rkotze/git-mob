import { gitAuthors } from './git-mob-api/git-authors';
import { gitMessage } from './git-mob-api/git-message';
import { AuthorNotFound } from './git-mob-api/errors/author-not-found';
import {
  getGlobalCommitTemplate,
  getLocalCommitTemplate,
} from './git-mob-api/git-config';
import { buildAuthorList, mockGitAuthors } from './test-helpers/author-mocks';
import {
  addCoAuthor,
  getSetCoAuthors,
  removeGitMobSection,
} from './git-mob-api/git-mob-config';
import { getSelectedCoAuthors, setCoAuthors, updateGitTemplate } from '.';

jest.mock('./commands');
jest.mock('./git-mob-api/git-authors');
jest.mock('./git-mob-api/git-message');
jest.mock('./git-mob-api/resolve-git-message-path');
jest.mock('./git-mob-api/git-config');
jest.mock('./git-mob-api/git-mob-config');

const mockedGitAuthors = jest.mocked(gitAuthors);
const mockedGitMessage = jest.mocked(gitMessage);
const mockedRemoveGitMobSection = jest.mocked(removeGitMobSection);
const mockedGetGlobalCommitTemplate = jest.mocked(getGlobalCommitTemplate);
const mockedGetLocalCommitTemplate = jest.mocked(getLocalCommitTemplate);
const mockedGetSetCoAuthors = jest.mocked(getSetCoAuthors);

describe('Git Mob core API', () => {
  afterEach(() => {
    mockedRemoveGitMobSection.mockReset();
    mockedGetGlobalCommitTemplate.mockReset();
    mockedGetLocalCommitTemplate.mockReset();
  });

  it('missing author to pick for list throws error', async () => {
    const authorKeys = ['ab', 'cd'];
    const mockWriteCoAuthors = jest.fn(async () => undefined);
    const mockRemoveCoAuthors = jest.fn(async () => '');
    mockedGitAuthors.mockReturnValue(mockGitAuthors([...authorKeys, 'ef']));

    mockedGitMessage.mockReturnValue({
      writeCoAuthors: mockWriteCoAuthors,
      readCoAuthors: () => '',
      removeCoAuthors: mockRemoveCoAuthors,
    });

    await expect(async () => {
      await setCoAuthors([...authorKeys, 'rk']);
    }).rejects.toThrow(AuthorNotFound);

    expect(mockedRemoveGitMobSection).not.toHaveBeenCalled();
  });

  it('apply co-authors to git config and git message', async () => {
    const authorKeys = ['ab', 'cd'];
    const authorList = buildAuthorList(authorKeys);
    const mockWriteCoAuthors = jest.fn(async () => undefined);
    const mockRemoveCoAuthors = jest.fn(async () => '');
    mockedGitAuthors.mockReturnValue(mockGitAuthors([...authorKeys, 'ef']));

    mockedGitMessage.mockReturnValue({
      writeCoAuthors: mockWriteCoAuthors,
      readCoAuthors: () => '',
      removeCoAuthors: mockRemoveCoAuthors,
    });

    const coAuthors = await setCoAuthors(authorKeys);

    expect(mockedRemoveGitMobSection).toHaveBeenCalledTimes(1);
    expect(mockRemoveCoAuthors).toHaveBeenCalledTimes(1);
    expect(addCoAuthor).toHaveBeenCalledTimes(2);
    expect(mockWriteCoAuthors).toHaveBeenCalledWith(authorList);
    expect(coAuthors).toEqual(authorList);
  });

  it('update git template by adding co-authors', async () => {
    const authorKeys = ['ab', 'cd'];
    const authorList = buildAuthorList(authorKeys);
    const mockWriteCoAuthors = jest.fn();

    mockedGitMessage.mockReturnValue({
      writeCoAuthors: mockWriteCoAuthors,
      readCoAuthors: () => '',
      removeCoAuthors: jest.fn(async () => ''),
    });

    await updateGitTemplate(authorList);

    expect(mockWriteCoAuthors).toHaveBeenCalledWith(authorList);
  });

  // GitMob is Global by default: https://github.com/rkotze/git-mob/discussions/81
  it('using local gitmessage updates local & global gitmessage with co-authors', async () => {
    const authorKeys = ['ab', 'cd'];
    const authorList = buildAuthorList(authorKeys);
    const mockWriteCoAuthors = jest.fn();
    const mockRemoveCoAuthors = jest.fn();

    mockedGetLocalCommitTemplate.mockResolvedValueOnce('template/path');
    mockedGitMessage.mockReturnValue({
      writeCoAuthors: mockWriteCoAuthors,
      readCoAuthors: () => '',
      removeCoAuthors: mockRemoveCoAuthors,
    });

    await updateGitTemplate(authorList);

    expect(mockedGetLocalCommitTemplate).toHaveBeenCalledTimes(1);
    expect(mockedGetGlobalCommitTemplate).toHaveBeenCalledTimes(1);
    expect(mockWriteCoAuthors).toHaveBeenCalledTimes(2);
    expect(mockWriteCoAuthors).toHaveBeenCalledWith(authorList);
    expect(mockRemoveCoAuthors).not.toHaveBeenCalled();
  });

  it('update git template by removing all co-authors', async () => {
    const mockRemoveCoAuthors = jest.fn();
    const mockWriteCoAuthors = jest.fn();

    mockedGitMessage.mockReturnValue({
      writeCoAuthors: mockWriteCoAuthors,
      readCoAuthors: () => '',
      removeCoAuthors: mockRemoveCoAuthors,
    });

    await updateGitTemplate();

    expect(mockRemoveCoAuthors).toHaveBeenCalledTimes(1);
    expect(mockWriteCoAuthors).not.toHaveBeenCalled();
  });

  it('Get the selected co-authors', async () => {
    const listAll = buildAuthorList(['ab', 'cd']);
    const selectedAuthor = listAll[1];
    mockedGetSetCoAuthors.mockResolvedValueOnce(selectedAuthor.toString());
    const selected = await getSelectedCoAuthors(listAll);
    expect(mockedGetSetCoAuthors).toHaveBeenCalledTimes(1);
    expect(selected).toEqual([selectedAuthor]);
  });
});
