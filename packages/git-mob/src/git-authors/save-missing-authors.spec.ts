import test from 'ava';
import type { SinonSandbox, SinonStub } from 'sinon';
import { createSandbox, assert } from 'sinon';
import { Author } from 'git-mob-core';
import { mobConfig } from '../git-mob-commands';
import { saveMissingAuthors, findMissingAuthors } from './save-missing-authors';

const savedAuthors = [
  new Author('jd', 'Jane Doe', 'jane@findmypast.com'),
  new Author('fb', 'Frances Bar', 'frances-bar@findmypast.com'),
];

const gitHubAuthors = [
  new Author('rkotze', 'Richard', 'rich@gitmob.com'),
  new Author('dideler', 'Denis', 'denis@gitmob.com'),
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

  t.deepEqual(
    await saveMissingAuthors(
      ['rkotze', 'dideler', 'jd'],
      savedAuthors,
      fetchAuthorsStub,
      saveCoauthorStub
    ),
    []
  );
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

  await saveMissingAuthors(
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

  const authorList = await saveMissingAuthors(
    ['rkotze', 'dideler', 'jd'],
    savedAuthors,
    fetchAuthorsStub,
    saveCoauthorStub
  );

  const expectedAuthorList = [
    'Richard <rich@gitmob.com>',
    'Denis <denis@gitmob.com>',
  ];

  t.deepEqual(authorList, expectedAuthorList);
});

test('Save missing co-author', async t => {
  const rkotzeAuthor = [new Author('rkotze', 'Richard', 'rich@gitmob.com')];
  const fetchAuthorsStub = sandbox.stub().resolves(rkotzeAuthor);
  sandbox.stub(mobConfig, 'fetchFromGitHub').returns(true);

  await saveMissingAuthors(
    ['rkotze', 'jd'],
    savedAuthors,
    fetchAuthorsStub,
    saveCoauthorStub
  );

  const rkotzeAuthorList = [new Author('rkotze', 'Richard', 'rich@gitmob.com')];

  t.notThrows(() => {
    assert.calledWith(saveCoauthorStub, rkotzeAuthorList);
  }, 'Not called with GitMobCoauthors type');
});

test('Throw error if author not found', async t => {
  const fetchAuthorsStub = sandbox.stub().rejects();
  sandbox.stub(mobConfig, 'fetchFromGitHub').returns(true);

  await t.throwsAsync(async () =>
    saveMissingAuthors(['rkotze', 'dideler'], savedAuthors, fetchAuthorsStub)
  );
});
