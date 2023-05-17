const { Author } = require('../author');
const { gitAuthors, pathToCoAuthors } = require('.');

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

test('.git-coauthors file does not exist', async () => {
  const authors = gitAuthors(() =>
    Promise.reject(new Error('enoent: no such file or directory, open'))
  );
  await expect(authors.read()).rejects.toEqual(
    expect.objectContaining({
      message: expect.stringMatching(/enoent: no such file or directory, open/i),
    })
  );
});

test('.git-coauthors by default is in the home directory', async t => {
  t.is(pathToCoAuthors(), "~/.git-coauthors");
});

test('.git-coauthors is set to the repo root if one exists', async t => {
  t.regex(gitCoauthorsPath(), /.+git-mob\/\.git-coauthors$/);
});

test('.git-coauthors can be overwritten by the env var', async t => {
  const oldEnv = process.env.GITMOB_COAUTHORS_PATH;
  try {
    process.env.GITMOB_COAUTHORS_PATH = "~/Env/Path/.git-co-authors";
    t.is(pathToCoAuthors(), "~/Env/Path/.git-co-authors")
  } finally {
    process.env.GITMOB_COAUTHORS_PATH = oldEnv;
  }
});

test('invalid json contents from .git-coauthors', async () => {
  const authors = gitAuthors(() => Promise.resolve(invalidJsonString));

  // const error = await t.throwsAsync(() => authors.read());
  await expect(authors.read()).rejects.toEqual(
    expect.objectContaining({
      message: expect.stringMatching(/invalid json/i),
    })
  );
});

test('read contents from .git-coauthors', async () => {
  const authors = gitAuthors(() => Promise.resolve(validJsonString));

  const json = await authors.read();
  expect(json).toEqual(authorsJson);
});

test('create an organised string list of .git-coauthors', async () => {
  const authors = gitAuthors(() => Promise.resolve(validJsonString));

  const json = await authors.read();
  const authorList = authors.toList(json);
  const expectAuthorList = [
    new Author('jd', 'Jane Doe', 'jane@findmypast.com'),
    new Author('fb', 'Frances Bar', 'frances-bar@findmypast.com'),
  ];
  expect(expectAuthorList).toEqual(authorList);
});

test('find and format "jd" and "fb" to an array of co-authors', () => {
  const authors = gitAuthors();
  const coAuthorList = authors.coAuthors(['jd', 'fb'], authorsJson);
  expect(coAuthorList).toEqual([
    'Jane Doe <jane@findmypast.com>',
    'Frances Bar <frances-bar@findmypast.com>',
  ]);
});

test('find and format "jd" to an array of one co-author', () => {
  const authors = gitAuthors();
  const coAuthorList = authors.coAuthors(['jd'], authorsJson);
  expect(coAuthorList).toEqual(['Jane Doe <jane@findmypast.com>']);
});

test('Throw error if initials of author are not found', () => {
  const authors = gitAuthors();
  expect(() => authors.coAuthors(['jd', 'hp'], authorsJson)).toThrowError(
    expect.objectContaining({
      message: expect.stringMatching('Author with initials "hp" not found!'),
    })
  );
});

test('find initials of co-authors', () => {
  const authors = gitAuthors();
  const coAuthorsInitials = authors.coAuthorsInitials(authorsJson, [
    'Jane Doe <jane@findmypast.com>',
  ]);

  expect(coAuthorsInitials).toEqual(['jd']);
});
