import { mob } from './commands';
import { Author } from './git-mob-api/author';
import { gitAuthors } from './git-mob-api/git-authors';
import { gitMessage } from './git-mob-api/git-message';
import { AuthorNotFound } from './git-mob-api/errors/author-not-found';
import {
  getGlobalCommitTemplate,
  getLocalCommitTemplate,
} from './git-mob-api/git-config';
import { setCoAuthors, updateGitTemplate } from '.';

jest.mock('./commands');
jest.mock('./git-mob-api/git-authors');
jest.mock('./git-mob-api/git-message');
jest.mock('./git-mob-api/resolve-git-message-path');
jest.mock('./git-mob-api/git-config');

const mockedGitAuthors = jest.mocked(gitAuthors);
const mockedGitMessage = jest.mocked(gitMessage);
const mockedMob = jest.mocked(mob);
const mockedGetGlobalCommitTemplate = jest.mocked(getGlobalCommitTemplate);
const mockedGetLocalCommitTemplate = jest.mocked(getLocalCommitTemplate);

describe('Git Mob API', () => {
  function buildAuthors(keys: string[]) {
    return keys.map(key => new Author(key, key + ' lastName', key + '@email.com'));
  }

  function buildMockGitAuthors(keys: string[]) {
    const authors = buildAuthors(keys);
    return {
      read: jest.fn(async () => ''),
      write: jest.fn(async () => ''),
      overwrite: jest.fn(async () => ''),
      fileExists: jest.fn(() => true),
      coAuthors: jest.fn(() => []),
      author: jest.fn(() => ({})),
      coAuthorsInitials: jest.fn(() => []),
      toList: jest.fn(() => authors),
    };
  }

  afterEach(() => {
    mockedMob.removeGitMobSection.mockReset();
    mockedGetGlobalCommitTemplate.mockReset();
    mockedGetLocalCommitTemplate.mockReset();
  });

  it('missing author to pick for list throws error', async () => {
    const authorKeys = ['ab', 'cd'];
    const mockWriteCoAuthors = jest.fn(async () => undefined);
    const mockRemoveCoAuthors = jest.fn(async () => '');
    mockedGitAuthors.mockReturnValue(buildMockGitAuthors([...authorKeys, 'ef']));

    mockedGitMessage.mockReturnValue({
      writeCoAuthors: mockWriteCoAuthors,
      readCoAuthors: () => '',
      removeCoAuthors: mockRemoveCoAuthors,
    });

    await expect(async () => {
      await setCoAuthors([...authorKeys, 'rk']);
    }).rejects.toThrow(AuthorNotFound);

    expect(mob.removeGitMobSection).not.toHaveBeenCalled();
  });

  it('apply co-authors to git config and git message', async () => {
    const authorKeys = ['ab', 'cd'];
    const authorList = buildAuthors(authorKeys);
    const mockWriteCoAuthors = jest.fn(async () => undefined);
    const mockRemoveCoAuthors = jest.fn(async () => '');
    mockedGitAuthors.mockReturnValue(buildMockGitAuthors([...authorKeys, 'ef']));

    mockedGitMessage.mockReturnValue({
      writeCoAuthors: mockWriteCoAuthors,
      readCoAuthors: () => '',
      removeCoAuthors: mockRemoveCoAuthors,
    });

    const coAuthors = await setCoAuthors(authorKeys);

    expect(mob.removeGitMobSection).toBeCalledTimes(1);
    expect(mockRemoveCoAuthors).toBeCalledTimes(1);
    expect(mob.gitAddCoAuthor).toBeCalledTimes(2);
    expect(mockWriteCoAuthors).toBeCalledWith(authorList);
    expect(coAuthors).toEqual(authorList);
  });

  it('update git template by adding co-authors', async () => {
    const authorKeys = ['ab', 'cd'];
    const authorList = buildAuthors(authorKeys);
    const mockWriteCoAuthors = jest.fn();

    mockedGitMessage.mockReturnValue({
      writeCoAuthors: mockWriteCoAuthors,
      readCoAuthors: () => '',
      removeCoAuthors: jest.fn(async () => ''),
    });

    await updateGitTemplate(authorList);

    expect(mockWriteCoAuthors).toBeCalledWith(authorList);
  });

  // GitMob is Global by default: https://github.com/rkotze/git-mob/discussions/81
  it('using local gitmessage updates local & global gitmessage with co-authors', async () => {
    const authorKeys = ['ab', 'cd'];
    const authorList = buildAuthors(authorKeys);
    const mockWriteCoAuthors = jest.fn();
    const mockRemoveCoAuthors = jest.fn();

    mockedGetLocalCommitTemplate.mockResolvedValueOnce('template/path');
    mockedGitMessage.mockReturnValue({
      writeCoAuthors: mockWriteCoAuthors,
      readCoAuthors: () => '',
      removeCoAuthors: mockRemoveCoAuthors,
    });

    await updateGitTemplate(authorList);

    expect(mockedGetLocalCommitTemplate).toBeCalledTimes(1);
    expect(mockedGetGlobalCommitTemplate).toBeCalledTimes(1);
    expect(mockWriteCoAuthors).toBeCalledTimes(2);
    expect(mockWriteCoAuthors).toBeCalledWith(authorList);
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

    expect(mockRemoveCoAuthors).toBeCalledTimes(1);
    expect(mockWriteCoAuthors).not.toHaveBeenCalled();
  });
});
