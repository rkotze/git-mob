import test from 'ava';
import type { SinonSandbox, SinonStub } from 'sinon';
import { createSandbox, assert } from 'sinon';
import { mobConfig } from '../git-mob-commands';
import { composeAuthors, findMissingAuthors } from './compose-authors';
import { Author } from 'git-mob-core';

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

const savedAuthors = [
  new Author('jd', 'Jane Doe', 'jane@findmypast.com'),
  new Author('fb', 'Frances Bar', 'frances-bar@findmypast.com'),
];

const gitHubAuthors = [
  {
    key: 'rkotze',
    name: 'Richard',
    email: 'rich@gitmob.com',
  },
  {
    key: 'dideler',
    name: 'Denis',
    email: 'denis@gitmob.com',
  },
];

let sandbox: SinonSandbox;
let saveCoauthorStub: SinonStub;

test.before(() => {
  sandbox = createSandbox();
  saveCoauthorStub = sandbox.stub();
});

test.afterEach(() => {
  sandbox.restore();
});

test('Search from GitHub not enabled', async t => {
  const fetchAuthorsStub = sandbox.stub().resolves(gitHubAuthors);
  sandbox.stub(mobConfig, 'fetchFromGitHub').returns(false);

  expect(
    await composeAuthors(
      ['rkotze', 'dideler', 'jd'],
      savedAuthors,
      fetchAuthorsStub,
      saveCoauthorStub
    )
  ).toBeNull();
});

test('Find missing author initials "rkotze" and "dideler" to an array', t => {
  const missingCoAuthor = findMissingAuthors(
    ['rkotze', 'dideler', 'jd'],
    savedAuthors
  );
  t.deepEqual(missingCoAuthor, ['rkotze', 'dideler']);
});

test('No missing author initials', t => {
  const missingCoAuthor = findMissingAuthors(['jd', 'fb'], savedAuthors);
  t.deepEqual(missingCoAuthor, []);
});

test('Search GitHub for missing co-authors', async t => {
  const fetchAuthorsStub = sandbox.stub().resolves(gitHubAuthors);
  sandbox.stub(mobConfig, 'fetchFromGitHub').returns(true);

  await composeAuthors(
    ['rkotze', 'dideler', 'jd'],
    savedAuthors,
    fetchAuthorsStub,
    saveCoauthorStub
  );
  t.notThrows(() => {
    assert.calledWith(fetchAuthorsStub, ['rkotze', 'dideler']);
  }, 'Not called with ["rkotze", "dideler"]');
});

test('Create author list from GitHub and co-author file', async t => {
  const fetchAuthorsStub = sandbox.stub().resolves(gitHubAuthors);
  sandbox.stub(mobConfig, 'fetchFromGitHub').returns(true);

  const authorList = await composeAuthors(
    ['rkotze', 'dideler', 'jd'],
    savedAuthors,
    fetchAuthorsStub,
    saveCoauthorStub
  );

  const expectedAuthorList = [
    'Richard <rich@gitmob.com>',
    'Denis <denis@gitmob.com>',
    'Jane Doe <jane@findmypast.com>',
  ];

  t.deepEqual(authorList, expectedAuthorList);
});

test('Save missing co-author', async t => {
  const rkotzeAuthor = [
    {
      key: 'rkotze',
      name: 'Richard',
      email: 'rich@gitmob.com',
    },
  ];
  const fetchAuthorsStub = sandbox.stub().resolves(rkotzeAuthor);
  sandbox.stub(mobConfig, 'fetchFromGitHub').returns(true);

  await composeAuthors(
    ['rkotze', 'jd'],
    savedAuthors,
    fetchAuthorsStub,
    saveCoauthorStub
  );

  const rkotzeAuthorList = {
    rkotze: {
      name: 'Richard',
      email: 'rich@gitmob.com',
    },
  };

  t.notThrows(() => {
    assert.calledWith(saveCoauthorStub, {
      coauthors: {
        ...savedAuthors,
        ...rkotzeAuthorList,
      },
    });
  }, 'Not called with GitMobCoauthors type');
});

test('Create author list from co-author file only', async t => {
  const fetchAuthorsStub = sandbox.stub().resolves([]);

  const authorList = await composeAuthors(
    ['jd'],
    savedAuthors,
    fetchAuthorsStub,
    saveCoauthorStub
  );

  const expectedAuthorList = ['Jane Doe <jane@findmypast.com>'];

  t.deepEqual(authorList, expectedAuthorList);
});

test('Throw error if author not found', async t => {
  const fetchAuthorsStub = sandbox.stub().resolves(gitHubAuthors);

  await t.throwsAsync(async () =>
    composeAuthors(['rkotze', 'dideler', 'james'], savedAuthors, fetchAuthorsStub)
  );
});

test('Throw error if author not found because fetch from GitHub is false', async t => {
  const fetchAuthorsStub = sandbox.stub().resolves(gitHubAuthors);

  const error = await t.throwsAsync(async () =>
    composeAuthors(['rkotze', 'dideler', 'jd'], savedAuthors, fetchAuthorsStub)
  );

  t.regex(error ? error.message : '', /author with initials "rkotze" not found!/i);
});
