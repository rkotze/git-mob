/* eslint quotes: ["off", "double"] */
/* eslint quote-props: ["off", "always"] */

const test = require('ava');
const { gitAuthors } = require('.');

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

test('find and format "jd" and "fb" to an array of co-authors', t => {
  const authors = gitAuthors();
  const coAuthorList = authors.coAuthors(['jd', 'fb'], authorsJson);
  t.deepEqual(
    coAuthorList,
    ['Jane Doe <jane@findmypast.com>', 'Frances Bar <frances-bar@findmypast.com>']
  );
});

test('find and format "jd" to an array of one co-author', t => {
  const authors = gitAuthors();
  const coAuthorList = authors.coAuthors(['jd'], authorsJson);
  t.deepEqual(coAuthorList, ['Jane Doe <jane@findmypast.com>']);
});

test('Throw error if initials of author are not found', t => {
  const authors = gitAuthors();
  const error = t.throws(() => authors.coAuthors(['jd', 'hp'], authorsJson));

  t.is(error.message, 'Author with initials "hp" not found!');
});

test('find initials of co-authors', t => {
  const authors = gitAuthors();
  const coAuthorsInitials = authors.coAuthorsInitials(authorsJson, [
    'Jane Doe <jane@findmypast.com>',
  ]);

  t.deepEqual(coAuthorsInitials, ['jd']);
});
