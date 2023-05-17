/* eslint quotes: ["off", "double"] */
/* eslint quote-props: ["off", "always"] */

import test from 'ava';
import { gitAuthors, gitCoauthorsPath } from '.';

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

test('.git-coauthors file does not exist', async t => {
  const authors = gitAuthors(() =>
    Promise.reject(new Error('enoent: no such file or directory, open'))
  );
  const error = await t.throwsAsync(() => authors.read());
  t.regex(error.message, /enoent: no such file or directory, open/i);
});

test('.git-coauthors by default is in the home directory', async t => {
  t.deepEqual(gitCoauthorsPath(), "~/.git-coauthors");
});

test('.git-coauthors is set to the repo root if one exists', async t => {
  t.deepEqual(gitCoauthorsPath(() => '~/Repo/Path'), "~/Repo/Path/.git-coauthors");
});

test('.git-coauthors can be overwritten by the env var', async t => {
  const oldEnv = process.env.GITMOB_COAUTHORS_PATH;
  try {
    process.env.GITMOB_COAUTHORS_PATH = "~/Env/Path/.git-co-authors";
    t.deepEqual(gitCoauthorsPath(), "~/Env/Path/.git-co-authors")
  } finally {
    process.env.GITMOB_COAUTHORS_PATH = oldEnv;
  }
  
});

test('invalid json contents from .git-coauthors', async t => {
  const authors = gitAuthors(() => Promise.resolve(invalidJsonString));

  const error = await t.throwsAsync(() => authors.read());
  t.regex(error.message, /invalid json/i);
});

test('read contents from .git-coauthors', async t => {
  const authors = gitAuthors(() => Promise.resolve(validJsonString));

  const json = await authors.read();
  t.deepEqual(json, authorsJson);
});

test('create an organised string list of .git-coauthors', async t => {
  const authors = gitAuthors(() => Promise.resolve(validJsonString));

  const json = await authors.read();
  const authorList = authors.toList(json);
  const expectAuthorList = [
    'jd Jane Doe jane@findmypast.com',
    'fb Frances Bar frances-bar@findmypast.com',
  ];
  t.deepEqual(expectAuthorList, authorList);
});

test('find initials of co-authors', t => {
  const authors = gitAuthors();
  const coAuthorsInitials = authors.coAuthorsInitials(authorsJson, [
    'Jane Doe <jane@findmypast.com>',
  ]);

  t.deepEqual(coAuthorsInitials, ['jd']);
});
