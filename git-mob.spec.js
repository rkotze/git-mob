import fs from 'fs';
import { execSync } from 'child_process';
import test from 'ava';
import { stripIndent } from 'common-tags';
import eol from 'eol';

test.beforeEach('reset state', () => {
  removeAuthor();
  removeCoAuthors();
});

test.after.always('cleanup', () => {
  exec('git config --remove-section user');
  exec('git config --remove-section git-mob');
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
    const { code, stderr } = exec('git mob --help');

    t.regex(stderr, /no manual entry for git-mob/i);
    t.not(code, 0);
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
  const { stderr, code } = exec('git mob rk');

  t.regex(stderr, /Author with initials "rk" not found!/i);
  t.not(code, 0);
});

test.todo(
  'write to .gitmessage file which does not exist (this currently fails)'
);

test('overwrites old mob when setting a new mob', t => {
  addAuthor('John Doe', 'jdoe@example.com');
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

function setGitMessageFile() {
  fs.writeFileSync(
    process.env.GITMOB_MESSAGE_PATH,
    stripIndent`
  A commit title

  A commit body that goes into more detail.`
  );
}

function exec(command) {
  try {
    return {
      stdout: execSync(command, { encoding: 'utf8' }),
      code: 0,
    };
  } catch (err) {
    return {
      code: err.status,
      pid: err.pid,
      stderr: err.stderr,
      stdout: err.stdout,
      cmd: err.cmd,
    };
  }
}
