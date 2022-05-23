const os = require('os');
const test = require('ava');
const { stripIndent } = require('common-tags');
const eol = require('eol');
const tempy = require('tempy');

const {
  addAuthor,
  addCoAuthor,
  removeCoAuthors,
  unsetCommitTemplate,
  safelyRemoveGitConfigSection,
  removeGitConfigSection,
  setGitMessageFile,
  readGitMessageFile,
  deleteGitMessageFile,
  exec,
  setCoauthorsFile,
  deleteCoauthorsFile,
  retainLocalAuthor,
} = require('../test-helpers');

let restoreLocalAuthor = null;
test.before('Check author', () => {
  restoreLocalAuthor = retainLocalAuthor();
});

test.after.always('cleanup', () => {
  deleteGitMessageFile();
  restoreLocalAuthor();
});

test.afterEach.always('cleanup', () => {
  removeCoAuthors();
  removeGitConfigSection('git-mob');
  safelyRemoveGitConfigSection('user');
  safelyRemoveGitConfigSection('commit');
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

test('--list print a list of available co-authors', t => {
  setCoauthorsFile();
  const actual = exec('git mob --list').stdout.trimEnd();
  const expected = [
    'jd Jane Doe jane@findmypast.com',
    'fb Frances Bar frances-bar@findmypast.com',
    'ea Elliot Alderson ealderson@findmypast.com',
  ].join(os.EOL);

  t.is(actual, expected);
  deleteCoauthorsFile();
});

test('prints only primary author when there is no mob', t => {
  addAuthor('John Doe', 'jdoe@example.com');

  const actual = exec('git mob').stdout.trimEnd();

  t.is(actual, 'John Doe <jdoe@example.com>');
});

test('prints current mob', t => {
  addAuthor('John Doe', 'jdoe@example.com');
  addCoAuthor('Dennis Ideler', 'dideler@findmypast.com');
  addCoAuthor('Richard Kotze', 'rkotze@findmypast.com');

  const actual = exec('git mob').stdout.trimEnd();
  const expected = stripIndent`
    John Doe <jdoe@example.com>
    Dennis Ideler <dideler@findmypast.com>
    Richard Kotze <rkotze@findmypast.com>
  `;

  t.is(actual, expected);
});

test('sets mob when co-author initials found', t => {
  setCoauthorsFile();
  addAuthor('Billy the Kid', 'billy@example.com');

  const actual = exec('git mob jd ea').stdout.trimEnd();
  const expected = stripIndent`
    Billy the Kid <billy@example.com>
    Jane Doe <jane@findmypast.com>
    Elliot Alderson <ealderson@findmypast.com>
  `;

  t.is(actual, expected);
  deleteCoauthorsFile();
});

test('sets mob and override author', t => {
  setCoauthorsFile();
  addAuthor('Billy the Kid', 'billy@example.com');

  const actual = exec('git mob -o jd ea').stdout.trimEnd();
  const expected = stripIndent`
    Jane Doe <jane@findmypast.com>
    Elliot Alderson <ealderson@findmypast.com>
  `;

  t.is(actual, expected);
});

test('errors when co-author initials not found', t => {
  setCoauthorsFile();
  const { stderr, status } = exec('git mob rk');

  t.regex(stderr, /author with initials "rk" not found!/i);
  t.not(status, 0);
  deleteCoauthorsFile();
});

test('overwrites old mob when setting a new mob', t => {
  setCoauthorsFile();
  setGitMessageFile();
  addAuthor('John Doe', 'jdoe@example.com');

  exec('git mob jd');

  const actualOutput = exec('git mob ea').stdout.trimEnd();
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
  deleteCoauthorsFile();
});

test('appends co-authors to an existing commit template', t => {
  setCoauthorsFile();
  setGitMessageFile();
  addAuthor('Thomas Anderson', 'neo@example.com');

  exec('git mob jd ea');

  const actualGitMessage = readGitMessageFile();
  const expectedGitMessage = eol.auto(stripIndent`
    A commit title

    A commit body that goes into more detail.

    Co-authored-by: Jane Doe <jane@findmypast.com>
    Co-authored-by: Elliot Alderson <ealderson@findmypast.com>`);

  t.is(actualGitMessage, expectedGitMessage);

  unsetCommitTemplate();
  deleteCoauthorsFile();
});

test('appends co-authors to a new commit template', t => {
  deleteGitMessageFile();
  setCoauthorsFile();
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
  deleteCoauthorsFile();
});

test('warns when used outside of a git repo', t => {
  const repoDir = process.cwd();
  const temporaryDir = tempy.directory();
  process.chdir(temporaryDir);

  const { stderr, status } = exec('git mob');

  t.regex(stderr, /not a git repository/i);
  t.not(status, 0);

  process.chdir(repoDir);
});
