/* eslint quotes: ["off", "double"] */
/* eslint quote-props: ["off", "always"] */

import test from 'ava';
import { gitAuthors } from './index.js';

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
