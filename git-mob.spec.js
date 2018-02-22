import fs from 'fs';
import os from 'os';
import { spawnSync } from 'child_process';
import test from 'ava';
import { stripIndent } from 'common-tags';
import eol from 'eol';

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
  test.skip('--help is intercepted by git launcher on Windows', () => {});
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

test('sets mob when co-author initials found in .git-authors file', t => {
  addAuthor('Billy the Kid', 'billy@example.com');

  const actual = exec('git mob jd ea').stdout.trimRight();
  const expected = stripIndent`
    Billy the Kid <billy@example.com>
    Jane Doe <jane@findmypast.com>
    Elliot Alderson <ealderson@findmypast.com>
  `;

  t.is(actual, expected);
});

test('errors when co-author initials not found in .git-authors', t => {
  const { stderr, status } = exec('git mob rk');

  t.regex(stderr, /Author with initials "rk" not found!/i);
  t.not(status, 0);
});

test('write to .gitmessage file which does not exist', t => {
  addAuthor('John Doe', 'jdoe@example.com');

  const actualOutput = exec('git mob ea').stdout.trimRight();

  const actualGitmessage = eol.auto(
    fs.readFileSync(process.env.GITMOB_MESSAGE_PATH, 'utf-8')
  );

  const expectedGitmessage =
    os.EOL +
    os.EOL +
    'Co-authored-by: Elliot Alderson <ealderson@findmypast.com>';

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

  const actualGitmessage = eol.auto(
    fs.readFileSync(process.env.GITMOB_MESSAGE_PATH, 'utf-8')
  );

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

  const actual = eol.auto(
    fs.readFileSync(process.env.GITMOB_MESSAGE_PATH, 'utf-8')
  );
  const expected = eol.auto(stripIndent`
    A commit title

    A commit body that goes into more detail.

    Co-authored-by: Jane Doe <jane@findmypast.com>
    Co-authored-by: Elliot Alderson <ealderson@findmypast.com>`);

  t.is(actual, expected);

  unsetCommitTemplate();
});

function addAuthor(name, email) {
  exec(`git config user.name "${name}"`);
  exec(`git config user.email "${email}"`);
}

function removeAuthor() {
  exec('git config --unset user.name');
  exec('git config --unset user.email');
}

function addCoAuthor(name, email) {
  exec(`git config --add git-mob.co-author "${name} <${email}>"`);
}

function removeCoAuthors() {
  exec('git config --unset-all git-mob.co-author');
}

function unsetCommitTemplate() {
  exec('git config --unset commit.template');
}

function localGitConfigSectionEmpty(section) {
  return exec(`git config --local --get-regexp '^${section}\.'`).status !== 0;
}

function safelyRemoveGitConfigSection(section) {
  if (localGitConfigSectionEmpty(section)) {
    exec(`git config --remove-section ${section}`);
  }
}

function removeGitConfigSection(section) {
  exec(`git config --remove-section ${section}`);
}

function setGitMessageFile() {
  try {
    fs.writeFileSync(
      process.env.GITMOB_MESSAGE_PATH,
      stripIndent`
  A commit title

  A commit body that goes into more detail.`
    );
  } catch (e) {
    console.log('Error setGitMessageFile: create test .gitmessage', e);
  }
}

function deleteGitMessageFile() {
  fs.unlinkSync(process.env.GITMOB_MESSAGE_PATH);
}

function exec(command) {
  return spawnSync(command, { encoding: 'utf8', shell: true });
}
