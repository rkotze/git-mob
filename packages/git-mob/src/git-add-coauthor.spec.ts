import test from 'ava';
import {
  setCoauthorsFile,
  readCoauthorsFile,
  exec,
  deleteCoauthorsFile,
} from '../test-helpers/index.js';

test.afterEach.always('cleanup', () => {
  deleteCoauthorsFile();
});

type CoAuthorList = {
  coauthors: Record<string, unknown>;
};

function loadCoauthors(): CoAuthorList {
  return JSON.parse(readCoauthorsFile() || '') as CoAuthorList;
}

test('adds a coauthor to coauthors file', t => {
  setCoauthorsFile();
  exec('git add-coauthor tb "Barry Butterworth" barry@butterworth.org');

  const addCoauthorActual = loadCoauthors();
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

test('does not add a coauthor to coauthors file if email invalid', t => {
  setCoauthorsFile();

  const error =
    t.throws(() => {
      exec('git add-coauthor tb "Barry Butterworth" barry.org');
    }) || new Error('No error');

  t.regex(error.message, /invalid email format/i);

  const addCoauthorActual = loadCoauthors();
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

  const error =
    t.throws(() => {
      exec('git add-coauthor tb "Barry Butterworth"');
    }) || new Error('No error');

  t.regex(error.message, /incorrect number of parameters/i);

  const addCoauthorActual = loadCoauthors();
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
  const error =
    t.throws(() => {
      exec('git add-coauthor ea "Emily Anderson" "emily@anderson.org"');
    }) || new Error('No error');

  t.regex(error.message, /ea already exists in .git-coauthors/i);

  const addCoauthorActual = loadCoauthors();
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
