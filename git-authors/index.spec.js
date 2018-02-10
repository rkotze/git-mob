const test = require('ava');
const { gitAuthors } = require('./index');

const validYaml = `
authors:
  jd: Jane Doe; jane
  fb: Frances Bar
email:
  domain: findmypast.com`;

const authorsJson = {
  authors: {
    jd: 'Jane Doe; jane',
    fb: 'Frances Bar',
  },
  email: {
    domain: 'findmypast.com',
  },
};

test('.gitauthor file does not exist', async t => {
  const authors = gitAuthors(() =>
    Promise.reject(new Error('enoent: no such file or directory, open'))
  );
  const error = await t.throws(authors.read());
  t.regex(error.message, /enoent: no such file or directory, open/i);
});

test('read contents from .gitauthor', async t => {
  const authors = gitAuthors(() => Promise.resolve(validYaml));

  const json = await authors.read();
  t.deepEqual(json, authorsJson);
});

test('find and format to co-authors', async t => {
  const authors = gitAuthors();
  const coAuthorList = authors.coAuthors(['jd', 'fb'], authorsJson);
  t.deepEqual(
    [
      'Co-authored-by: Jane Doe <jane@findmypast.com>',
      'Co-authored-by: Frances Bar <frances_bar@findmypast.com>',
    ],
    coAuthorList
  );
});
