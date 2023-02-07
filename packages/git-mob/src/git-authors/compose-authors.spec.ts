import test from 'ava';
import type { SinonSandbox, SinonStub } from 'sinon';
import { createSandbox, assert } from 'sinon';
import { composeAuthors, findMissingAuthors } from './compose-authors';
import { mobConfig } from '../git-mob-commands';

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

test('Search GitHub for missing co-authors', async t => {
  const fetchAuthorsStub = sandbox.stub().resolves(gitHubAuthors);
  sandbox.stub(mobConfig, 'fetchFromGitHub').returns(true);

  await composeAuthors(
    ['rkotze', 'dideler', 'jd'],
    authorsJson.coauthors,
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
    authorsJson.coauthors,
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
    authorsJson.coauthors,
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
        ...authorsJson.coauthors,
        ...rkotzeAuthorList,
      },
    });
  }, 'Not called with GitMobCoauthors type');
});

test('Create author list from co-author file only', async t => {
  const fetchAuthorsStub = sandbox.stub().resolves([]);

  const authorList = await composeAuthors(
    ['jd'],
    authorsJson.coauthors,
    fetchAuthorsStub,
    saveCoauthorStub
  );

  const expectedAuthorList = ['Jane Doe <jane@findmypast.com>'];

  t.deepEqual(authorList, expectedAuthorList);
});

test('Throw error if author not found', async t => {
  const fetchAuthorsStub = sandbox.stub().resolves(gitHubAuthors);

  await t.throwsAsync(async () =>
    composeAuthors(
      ['rkotze', 'dideler', 'james'],
      authorsJson.coauthors,
      fetchAuthorsStub
    )
  );
});

test('Throw error if author not found because fetch from GitHub is false', async t => {
  const fetchAuthorsStub = sandbox.stub().resolves(gitHubAuthors);

  const error = await t.throwsAsync(async () =>
    composeAuthors(
      ['rkotze', 'dideler', 'jd'],
      authorsJson.coauthors,
      fetchAuthorsStub
    )
  );

  t.regex(error ? error.message : '', /author with initials "rkotze" not found!/i);
});
