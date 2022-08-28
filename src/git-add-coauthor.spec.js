import test, { afterEach } from 'ava';

import { setCoauthorsFile, readCoauthorsFile, exec, deleteCoauthorsFile } from '../test-helpers';

afterEach.always('cleanup', () => {
  deleteCoauthorsFile();
});

test('adds coauthor to coauthors file', t => {
  setCoauthorsFile();
  exec('git add-coauthor tb "Barry Butterworth" barry@butterworth.org');

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

  const error = t.throws(() => {
    exec('git add-coauthor tb "Barry Butterworth" barry.org');
  });

  t.regex(error.message, /invalid email format/i);

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

test('does not add coauthor to coauthors file if wrong amount of parameters', t => {
  setCoauthorsFile();

  const error = t.throws(() => {
    exec('git add-coauthor tb "Barry Butterworth"');
  });

  t.regex(error.message, /incorrect number of parameters/i);

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

test('does not add coauthor to coauthors file if key already exists', t => {
  setCoauthorsFile();
  exec('git add-coauthor ea "Emily Anderson" "emily@anderson.org"');

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

test('-h prints help', t => {
  const { stdout } = exec('git add-coauthor -h');

  t.regex(stdout, /usage/i);
  t.regex(stdout, /options/i);
  t.regex(stdout, /examples/i);
});
