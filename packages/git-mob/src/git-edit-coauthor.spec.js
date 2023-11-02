import test from 'ava';

import {
  setCoauthorsFile,
  readCoauthorsFile,
  exec,
  deleteCoauthorsFile,
} from '../test-helpers/index.js';

const { afterEach } = test;

afterEach.always('cleanup', () => {
  deleteCoauthorsFile();
});

test('edits coauthors name in coauthors file', t => {
  setCoauthorsFile();
  exec('git edit-coauthor ea --name="emily aldershot"');

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
        name: 'emily aldershot',
        email: 'ealderson@findmypast.com',
      },
    },
  };

  t.deepEqual(addCoauthorActual, addCoauthorExpected);
});

test('edits coauthors email in coauthors file', t => {
  setCoauthorsFile();
  exec('git edit-coauthor ea --email="emily@aldershot.com"');

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
        email: 'emily@aldershot.com',
      },
    },
  };

  t.deepEqual(addCoauthorActual, addCoauthorExpected);
});

test('edits coauthors name and email in coauthors file', t => {
  setCoauthorsFile();
  exec(
    'git edit-coauthor ea --email="emily@aldershot.com" --name="emily aldershot"'
  );

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
        name: 'emily aldershot',
        email: 'emily@aldershot.com',
      },
    },
  };

  t.deepEqual(addCoauthorActual, addCoauthorExpected);
});

test('does not update a random key input', t => {
  setCoauthorsFile();
  exec('git edit-coauthor ea --gender="female"');

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

test('does not update if author does not already exist', t => {
  setCoauthorsFile();
  exec('git edit-coauthor bb --name="barry butterworth"');

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
