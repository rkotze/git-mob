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

test('Search GitHub for missing co-authors', t => {
  const sandbox = createSandbox();
  const fetchAuthorsStub = sandbox.stub().resolves([
    {
      name: 'Richard Kotze',
      email: 'rich@gitmob.com',
    },
    {
      name: 'Denis',
      email: 'denis@gitmob.com',
    },
  ]);

  composeAuthors(
    ['rkotze', 'dideler', 'jd'],
    authorsJson.coauthors,
    fetchAuthorsStub
  );
  t.notThrows(() => {
    assert.calledWith(fetchAuthorsStub, ['rkotze', 'dideler']);
  }, 'Not called with ["rkotze", "dideler"]');
  sandbox.restore();
});
