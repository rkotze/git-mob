import test from 'ava';

import {
  setCoauthorsFile,
  readCoauthorsFile,
  exec,
  deleteCoauthorsFile,
} from '../test-helpers';

test.afterEach.always('cleanup', () => {
  deleteCoauthorsFile();
});

test('deletes coauthor from coauthors file', t => {
  setCoauthorsFile();
  exec('git delete-coauthor ea');

  const deleteCoauthorActual = JSON.parse(readCoauthorsFile());
  const deleteCoauthorExpected = {
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

  t.deepEqual(deleteCoauthorActual, deleteCoauthorExpected);
});

test('does nothing if initial are not a key in coauthors file', t => {
  setCoauthorsFile();
  exec('git delete-coauthor bb');

  const deleteCoauthorActual = JSON.parse(readCoauthorsFile());
  const deleteCoauthorExpected = {
    coauthors: {
      jd: {
        name: 'Jane Doe',
        email: 'jane@findmypast.com',
      },
      fb: {
        name: 'Frances Bar',
        email: 'frances-bar@findmypast.com',
      },
      ea: {
        name: 'Elliot Alderson',
        email: 'ealderson@findmypast.com',
      },
    },
  };

  t.deepEqual(deleteCoauthorActual, deleteCoauthorExpected);
});
