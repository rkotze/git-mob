import { join } from 'node:path';
import fs from 'node:fs';
import { Author } from '../author';
import { topLevelDirectory } from '../git-rev-parse';
import { gitAuthors, pathToCoAuthors } from './index';

jest.mock('../git-rev-parse');
const mockedTopLevelDirectory = jest.mocked(topLevelDirectory);

const validJsonString = `
{
  "coauthors": {
    "jd": {
      "name": "Jane Doe",
      "email": "jane@findmypast.com"
    },
    "fb": {
      "name": "Frances Bar",
      "email": "frances-bar@findmypast.com"
    }
  }
}`;

// Invalid because of comma at end of email
const invalidJsonString = `
{
  "coauthors": {
    "jd": {
      "name": "Jane Doe",
      "email": "jane@findmypast.com",
    }
  }
}`;

const authorsJson = {
  coauthors: {
    jd: {
      name: 'Jane Doe',
      email: 'jane@findmypast.com',
    },
    fb: {
      name: 'Frances Bar',
      email: 'frances-bar@findmypast.com',
    },
  },
};

beforeAll(() => {
  mockedTopLevelDirectory.mockResolvedValue('./path');
});

test('.git-coauthors file does not exist', async () => {
  const authors = gitAuthors(async () => {
    throw new Error('enoent: no such file or directory, open');
  });
  await expect(authors.read()).rejects.toEqual(
    expect.objectContaining({
      message: expect.stringMatching(
        /enoent: no such file or directory, open/i
      ) as string,
    })
  );
});

test('.git-coauthors by default is in the home directory', async () => {
  expect(await pathToCoAuthors()).toEqual(
    join(process.env.HOME || '', '.git-coauthors')
  );
});

test('Not running in Git repo should return home directory path', async () => {
  mockedTopLevelDirectory.mockImplementationOnce(() => {
    throw new Error('Fake error');
  });

  expect(await pathToCoAuthors()).toEqual(
    join(process.env.HOME || '', '.git-coauthors')
  );
});

test('.git-coauthors can be overwritten by a repo file', async () => {
  const mockedPath = './path/to';
  jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
  mockedTopLevelDirectory.mockResolvedValueOnce(mockedPath);
  expect(await pathToCoAuthors()).toEqual(join(mockedPath, '.git-coauthors'));
});

test('.git-coauthors can be overwritten by the env var', async () => {
  const oldEnv = process.env.GITMOB_COAUTHORS_PATH;
  try {
    process.env.GITMOB_COAUTHORS_PATH = '~/Env/Path/.git-co-authors';
    expect(await pathToCoAuthors()).toEqual('~/Env/Path/.git-co-authors');
  } finally {
    process.env.GITMOB_COAUTHORS_PATH = oldEnv;
  }
});

test('invalid json contents from .git-coauthors', async () => {
  const authors = gitAuthors(async () => invalidJsonString);
  await expect(authors.read()).rejects.toEqual(
    expect.objectContaining({
      message: expect.stringMatching(/invalid json/i) as string,
    })
  );
});

test('read contents from .git-coauthors', async () => {
  const authors = gitAuthors(async () => validJsonString);

  const json = (await authors.read()) as unknown;
  expect(json).toEqual(authorsJson);
});

test('create an organised string list of .git-coauthors', async () => {
  const authors = gitAuthors(async () => validJsonString);

  const json = (await authors.read()) as unknown;
  const authorList = authors.toList(json);
  const expectAuthorList = [
    new Author('jd', 'Jane Doe', 'jane@findmypast.com'),
    new Author('fb', 'Frances Bar', 'frances-bar@findmypast.com'),
  ];
  expect(expectAuthorList).toEqual(authorList);
});
