import { EOL } from 'node:os';
import { gitAuthors } from './git-mob-api/git-authors';
import { gitMessage } from './git-mob-api/git-message';
import { AuthorNotFound } from './git-mob-api/errors/author-not-found';
import * as gitConfig from './git-mob-api/git-config';
import { buildAuthorList, mockGitAuthors } from './test-helpers/author-mocks';
import {
  addCoAuthor,
  getSetCoAuthors,
  removeGitMobSection,
} from './git-mob-api/git-mob-config';
import { AuthorTrailers } from './git-mob-api/git-message/message-formatter';
import {
  getPrimaryAuthor,
  getSelectedCoAuthors,
  setCoAuthors,
  setPrimaryAuthor,
  updateGitTemplate,
} from '.';

jest.mock('./git-mob-api/exec-command');
jest.mock('./git-mob-api/git-authors');
jest.mock('./git-mob-api/git-message');
jest.mock('./git-mob-api/resolve-git-message-path');
jest.mock('./git-mob-api/git-config');
jest.mock('./git-mob-api/git-mob-config');

const mockedGitAuthors = jest.mocked(gitAuthors);
const mockedGitMessage = jest.mocked(gitMessage);
const mockedRemoveGitMobSection = jest.mocked(removeGitMobSection);
const mockedGitConfig = jest.mocked(gitConfig);
const mockedGetSetCoAuthors = jest.mocked(getSetCoAuthors);

describe('Git Mob core API', () => {
  afterEach(() => {
    mockedRemoveGitMobSection.mockReset();
    mockedGetSetCoAuthors.mockReset();
    mockedGitConfig.getGlobalCommitTemplate.mockReset();
    mockedGitConfig.getLocalCommitTemplate.mockReset();
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

    mockedGitConfig.getLocalCommitTemplate.mockResolvedValueOnce('template/path');
    mockedGitMessage.mockReturnValue({
      writeCoAuthors: mockWriteCoAuthors,
      readCoAuthors: () => '',
      removeCoAuthors: mockRemoveCoAuthors,
    });

    await updateGitTemplate(authorList);

    expect(mockedGitConfig.getLocalCommitTemplate).toHaveBeenCalledTimes(1);
    expect(mockedGitConfig.getGlobalCommitTemplate).toHaveBeenCalledTimes(1);
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

  it('Use exact email for selected co-authors', async () => {
    const listAll = buildAuthorList(['ab', 'efcd', 'cd']);
    const selectedAuthor = `git-mob.co-author ${listAll[1].toString()}`;
    mockedGetSetCoAuthors.mockResolvedValueOnce(selectedAuthor);
    const selected = await getSelectedCoAuthors(listAll);

    expect(mockedGetSetCoAuthors).toHaveBeenCalledTimes(1);
    expect(selected).toEqual([listAll[1]]);
  });

  it('Backward compatibility get the selected co-author using "git-mob.co-author"', async () => {
    const listAll = buildAuthorList(['ab', 'cd', 'ef', 'gh']);
    const selectedAuthors = [
      `git-mob.co-author ${listAll[1].toString()}`,
      `git-mob.${AuthorTrailers.ReviewedBy} ${listAll[2].toString()}`,
    ].join(EOL);

    mockedGetSetCoAuthors.mockResolvedValueOnce(selectedAuthors);
    const selected = await getSelectedCoAuthors(listAll);

    expect(mockedGetSetCoAuthors).toHaveBeenCalledTimes(1);
    expect(selected.length).toEqual(2);
    expect(selected[0]?.trailer).toEqual(AuthorTrailers.CoAuthorBy);
    expect(selected[1]?.trailer).toEqual(AuthorTrailers.ReviewedBy);
  });

  it('Get the selected co-authors and update respective trailers', async () => {
    const listAll = buildAuthorList(['ab', 'cd', 'ef', 'gh']);
    const selectedAuthors = [
      `git-mob.${AuthorTrailers.CoAuthorBy} ${listAll[1].toString()}`,
      `git-mob.${AuthorTrailers.SignedOffBy} ${listAll[2].toString()}`,
      `git-mob.${AuthorTrailers.ReviewedBy} ${listAll[3].toString()}`,
    ].join(EOL);

    mockedGetSetCoAuthors.mockResolvedValueOnce(selectedAuthors);
    const selected = await getSelectedCoAuthors(listAll);

    expect(mockedGetSetCoAuthors).toHaveBeenCalledTimes(1);
    expect(selected.length).toEqual(3);
    expect(selected[0]?.trailer).toEqual(AuthorTrailers.CoAuthorBy);
    expect(selected[1]?.trailer).toEqual(AuthorTrailers.SignedOffBy);
    expect(selected[2]?.trailer).toEqual(AuthorTrailers.ReviewedBy);
  });

  it('Get the Git primary author', async () => {
    const primaryAuthor = buildAuthorList(['prime'])[0];
    mockedGitConfig.getGitUserName.mockResolvedValueOnce(primaryAuthor.name);
    mockedGitConfig.getGitUserEmail.mockResolvedValueOnce(primaryAuthor.email);
    const author = await getPrimaryAuthor();
    expect(mockedGitConfig.getGitUserName).toHaveBeenCalledTimes(1);
    expect(mockedGitConfig.getGitUserEmail).toHaveBeenCalledTimes(1);
    expect(author).toEqual(primaryAuthor);
  });

  it('Set the Git primary author', async () => {
    const primaryAuthor = buildAuthorList(['prime'])[0];
    await setPrimaryAuthor(primaryAuthor);
    expect(mockedGitConfig.setGitUserName).toHaveBeenCalledWith(primaryAuthor.name);
    expect(mockedGitConfig.setGitUserEmail).toHaveBeenCalledWith(
      primaryAuthor.email
    );
  });
});
