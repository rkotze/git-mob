import test from 'ava';
import { createSandbox, assert } from 'sinon';
import { composeAuthors, findMissingAuthors } from './compose-authors';

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

test('Find missing author initials "rkotze" and "dideler" to an array', t => {
  const missingCoAuthor = findMissingAuthors(
    ['rkotze', 'dideler', 'jd'],
    authorsJson.coauthors
  );
  t.deepEqual(missingCoAuthor, ['rkotze', 'dideler']);
});

test('No missing author initials', t => {
  const missingCoAuthor = findMissingAuthors(['jd', 'fb'], authorsJson.coauthors);
  t.deepEqual(missingCoAuthor, []);
});

const gitHubAuthors = {
  rkotze: {
    name: 'Richard',
    email: 'rich@gitmob.com',
  },
  dideler: {
    name: 'Denis',
    email: 'denis@gitmob.com',
  },
};

test('Search GitHub for missing co-authors', async t => {
  const sandbox = createSandbox();
  const fetchAuthorsStub = sandbox.stub().resolves(gitHubAuthors);

  await composeAuthors(
    ['rkotze', 'dideler', 'jd'],
    authorsJson.coauthors,
    fetchAuthorsStub
  );
  t.notThrows(() => {
    assert.calledWith(fetchAuthorsStub, ['rkotze', 'dideler']);
  }, 'Not called with ["rkotze", "dideler"]');
  sandbox.restore();
});

test('Create author list from GitHub and co-author file', async t => {
  const sandbox = createSandbox();
  const fetchAuthorsStub = sandbox.stub().resolves(gitHubAuthors);

  const authorList = await composeAuthors(
    ['rkotze', 'dideler', 'jd'],
    authorsJson.coauthors,
    fetchAuthorsStub
  );

  const expectedAuthorList = [
    'Richard <rich@gitmob.com>',
    'Denis <denis@gitmob.com>',
    'Jane Doe <jane@findmypast.com>',
  ];

  t.deepEqual(authorList, expectedAuthorList);

  sandbox.restore();
});
