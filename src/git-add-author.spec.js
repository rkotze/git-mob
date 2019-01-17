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

test('adds coauthor to coauthors file', t => {
  setCoauthorsFile();
  exec('git add-author tb "Barry Butterworth" barry@butterworth.org');

  const addCoauthorActual = JSON.parse(readCoauthorsFile());
  const addCoauthorExpected = {
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
      tb: {
        name: 'Barry Butterworth',
        email: 'barry@butterworth.org',
      },
    },
  };

  t.deepEqual(addCoauthorActual, addCoauthorExpected);
});

test('does not add coauthor to coauthors file if email invalid', t => {
  setCoauthorsFile();
  exec('git add-author tb "Barry Butterworth" barry.org');

  const addCoauthorActual = JSON.parse(readCoauthorsFile());
  const addCoauthorExpected = {
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

  t.deepEqual(addCoauthorActual, addCoauthorExpected);
});
