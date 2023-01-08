const { mob } = require('./commands');
const { Author } = require('./git-mob-api/author');
const { gitAuthors } = require('./git-mob-api/git-authors');
const { gitMessage } = require('./git-mob-api/git-message');
const { setCoAuthors, updateGitTemplate } = require('.');

jest.mock('./commands');
jest.mock('./git-mob-api/git-authors');
jest.mock('./git-mob-api/git-message');
jest.mock('./git-mob-api/resolve-git-message-path');

describe('Git Mob API', () => {
  function buildAuthors(keys) {
    return keys.map(key => new Author(key, key + ' lastName', key + '@email.com'));
  }

  function buildMockGitAuthors(keys) {
    const authors = buildAuthors(keys);
    return function () {
      return {
        toList: jest.fn(() => authors),
        read: jest.fn(() => Promise.resolve()),
      };
    };
  }

  it('apply co-authors to git config and git message', async () => {
    const authorKeys = ['ab', 'cd'];
    const authorList = buildAuthors(authorKeys);
    const mockWriteCoAuthors = jest.fn();
    const mockRemoveCoAuthors = jest.fn();
    gitAuthors.mockImplementation(buildMockGitAuthors([...authorKeys, 'ef']));
    gitMessage.mockImplementation(() => ({
      writeCoAuthors: mockWriteCoAuthors,
      removeCoAuthors: mockRemoveCoAuthors,
    }));

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
    gitMessage.mockImplementation(() => ({
      writeCoAuthors: mockWriteCoAuthors,
    }));

    await updateGitTemplate(authorList);

    expect(mockWriteCoAuthors).toBeCalledWith(authorList);
  });

  it('update git template by removing all co-authors', async () => {
    const mockRemoveCoAuthors = jest.fn();
    gitMessage.mockImplementation(() => ({
      removeCoAuthors: mockRemoveCoAuthors,
    }));

    await updateGitTemplate();

    expect(mockRemoveCoAuthors).toBeCalledTimes(1);
  });
});