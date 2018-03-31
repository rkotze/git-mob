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

const authorsJson = {
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
};

test('.git-coauthors file does not exist', async t => {
  const authors = gitAuthors(() =>
    Promise.reject(new Error('enoent: no such file or directory, open'))
  );
  const error = await t.throws(authors.read());
  t.regex(error.message, /enoent: no such file or directory, open/i);
});

test('read contents from .git-coauthors', async t => {
  const authors = gitAuthors(() => Promise.resolve(validJsonString));

  const json = await authors.read();
  t.deepEqual(json, authorsJson);
});

test('find and format "jd" and "fb" to an array of co-authors', t => {
  const authors = gitAuthors();
  const coAuthorList = authors.coAuthors(['jd', 'fb'], authorsJson);
  t.deepEqual(
    [
      'Jane Doe <jane@findmypast.com>',
      'Frances Bar <frances-bar@findmypast.com>',
    ],
    coAuthorList
  );
});

test('find and format "jd" to an array of one co-author', t => {
  const authors = gitAuthors();
  const coAuthorList = authors.coAuthors(['jd'], authorsJson);
  t.deepEqual(['Jane Doe <jane@findmypast.com>'], coAuthorList);
});

test('Throw error if initials of author are not found', t => {
  const authors = gitAuthors();
  const error = t.throws(() => authors.coAuthors(['jd', 'hp'], authorsJson));

  t.is(error.message, 'Author with initials "hp" not found!');
});
