import os from 'os';
import test from 'ava';
import { stripIndent } from 'common-tags';
import eol from 'eol';

import {
  addAuthor,
  removeAuthor,
  addCoAuthor,
  removeCoAuthors,
  unsetCommitTemplate,
  safelyRemoveGitConfigSection,
  removeGitConfigSection,
  setGitMessageFile,
  readGitMessageFile,
  deleteGitMessageFile,
  exec,
} from '../test-helpers';

test.beforeEach('reset state', () => {
  removeAuthor();
  removeCoAuthors();
});

test.afterEach('cleanup', () => {
  removeAuthor();
  removeGitConfigSection('git-mob');
  safelyRemoveGitConfigSection('user');
  safelyRemoveGitConfigSection('commit');
});

test.after.always('cleanup', () => {
  deleteGitMessageFile();
});

test('-h prints help', t => {
  const { stdout } = exec('git mob -h');

  t.regex(stdout, /usage/i);
  t.regex(stdout, /options/i);
  t.regex(stdout, /examples/i);
});

if (process.platform === 'win32') {
  // Windows tries to open a man page at git-doc/git-mob.html which errors.
  test.skip('--help is intercepted by git launcher on Windows', () => { });
} else {
  test('--help is intercepted by git launcher', t => {
    const { status, stderr } = exec('git mob --help', { silent: true });

    t.regex(stderr, /no manual entry for git-mob/i);
    t.not(status, 0);
  });
}

test('-v prints version', t => {
  const { stdout } = exec('git mob -v');

  t.regex(stdout, /\d.\d.\d/);
});

test('--version prints version', t => {
  const { stdout } = exec('git mob --version');

  t.regex(stdout, /\d.\d.\d/);
});

test('prints only primary author when there is no mob', t => {
  addAuthor('John Doe', 'jdoe@example.com');

  const actual = exec('git mob').stdout.trimRight();

  t.is(actual, 'John Doe <jdoe@example.com>');
});

test('prints current mob', t => {
  addAuthor('John Doe', 'jdoe@example.com');
  addCoAuthor('Dennis Ideler', 'dideler@findmypast.com');
  addCoAuthor('Richard Kotze', 'rkotze@findmypast.com');

  const actual = exec('git mob').stdout.trimRight();
  const expected = stripIndent`
    John Doe <jdoe@example.com>
    Dennis Ideler <dideler@findmypast.com>
    Richard Kotze <rkotze@findmypast.com>
  `;

  t.is(actual, expected);
});

test('sets mob when co-author initials found in .git-coauthors file', t => {
  addAuthor('Billy the Kid', 'billy@example.com');

  const actual = exec('git mob jd ea').stdout.trimRight();
  const expected = stripIndent`
    Billy the Kid <billy@example.com>
    Jane Doe <jane@findmypast.com>
    Elliot Alderson <ealderson@findmypast.com>
  `;

  t.is(actual, expected);
});

test('errors when co-author initials not found in .git-coauthors', t => {
  const { stderr, status } = exec('git mob rk');

  t.regex(stderr, /Author with initials "rk" not found!/i);
  t.not(status, 0);
});

test('write to .gitmessage file which does not exist', t => {
  addAuthor('John Doe', 'jdoe@example.com');

  exec('git mob ea');

  const actualGitmessage = readGitMessageFile();
  const expectedGitmessage =
    os.EOL + os.EOL + 'Co-authored-by: Elliot Alderson <ealderson@findmypast.com>';

  t.is(actualGitmessage, expectedGitmessage);
});

test('overwrites old mob when setting a new mob', t => {
  addAuthor('John Doe', 'jdoe@example.com');
  setGitMessageFile();
  exec('git mob jd');

  const actualOutput = exec('git mob ea').stdout.trimRight();
  const expectedOutput = stripIndent`
    John Doe <jdoe@example.com>
    Elliot Alderson <ealderson@findmypast.com>
  `;

  t.is(actualOutput, expectedOutput);

  const actualGitmessage = readGitMessageFile();
  const expectedGitmessage = eol.auto(stripIndent`
    A commit title

    A commit body that goes into more detail.

    Co-authored-by: Elliot Alderson <ealderson@findmypast.com>`);

  t.is(actualGitmessage, expectedGitmessage);
});

// TODO: concurrent IO tests https://github.com/avajs/ava#temp-files
test('appends co-authors to .gitmessage file', t => {
  addAuthor('Thomas Anderson', 'neo@example.com');
  setGitMessageFile();

  exec('git mob jd ea');

  const actualGitMessage = readGitMessageFile();
  const expectedGitMessage = eol.auto(stripIndent`
    A commit title

    A commit body that goes into more detail.

    Co-authored-by: Jane Doe <jane@findmypast.com>
    Co-authored-by: Elliot Alderson <ealderson@findmypast.com>`);

  t.is(actualGitMessage, expectedGitMessage);

  unsetCommitTemplate();
});

test('no .gitmessage file when adding co-authors', t => {
  deleteGitMessageFile();
  addAuthor('Thomas Anderson', 'neo@example.com');

  exec('git mob jd ea');

  const actualGitMessage = readGitMessageFile();
  const expectedGitMessage = eol.auto(
    [
      os.EOL,
      os.EOL,
      'Co-authored-by: Jane Doe <jane@findmypast.com>',
      os.EOL,
      'Co-authored-by: Elliot Alderson <ealderson@findmypast.com>',
    ].join('')
  );

  t.is(actualGitMessage, expectedGitMessage);

  unsetCommitTemplate();
});
