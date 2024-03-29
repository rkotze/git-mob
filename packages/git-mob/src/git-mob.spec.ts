import { EOL } from 'node:os';
import test from 'ava';
import { stripIndent } from 'common-tags';
import { auto } from 'eol';
import { temporaryDirectory } from 'tempy';
import {
  addAuthor,
  addCoAuthor,
  removeCoAuthors,
  unsetCommitTemplate,
  safelyRemoveGitConfigSection,
  setGitMessageFile,
  readGitMessageFile,
  deleteGitMessageFile,
  exec,
  setCoauthorsFile,
  deleteCoauthorsFile,
  setup,
  tearDown,
} from '../test-helpers/index.js';

const { before, after, afterEach, skip } = test;

before('setup', () => {
  setup();
  setCoauthorsFile();
});

after.always('final cleanup', () => {
  deleteCoauthorsFile();
  deleteGitMessageFile();
  tearDown();
});

afterEach.always('each cleanup', () => {
  safelyRemoveGitConfigSection('git-mob');
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
  skip('--help is intercepted by git launcher on Windows', () => null);
} else {
  test('--help is intercepted by git launcher', t => {
    const error =
      t.throws(() => {
        exec('git mob --help');
      }) || new Error('No error');

    t.regex(error.message, /no manual entry for git-mob/i);
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
  const actual = exec('git mob --list').stdout.trimEnd();
  const expected = [
    'jd, Jane Doe, jane@findmypast.com',
    'fb, Frances Bar, frances-bar@findmypast.com',
    'ea, Elliot Alderson, ealderson@findmypast.com',
  ].join(EOL);

  t.is(actual, expected);
});

test('prints only primary author when there is no mob', t => {
  addAuthor('John Doe', 'jdoe@example.com');

  const actual = exec('git mob').stdout.trimEnd();

  t.is(actual, 'John Doe <jdoe@example.com>');
});

test('prints current mob', t => {
  addAuthor('John Doe', 'jdoe@example.com');
  addCoAuthor('Jane Doe', 'jane@findmypast.com');
  addCoAuthor('Elliot Alderson', 'ealderson@findmypast.com>');

  const actual = exec('git mob').stdout.trimEnd();
  const expected = stripIndent`
  John Doe <jdoe@example.com>
  Jane Doe <jane@findmypast.com>
  Elliot Alderson <ealderson@findmypast.com>`;

  t.is(actual, expected);
  // setting co-authors outside the git mob lifecycle the commit.template
  // is never updated. By default git mob is global and this asserts the
  // template is not updated as it's expect to be up to date.
  t.is(readGitMessageFile(true), undefined);
  removeCoAuthors();
});

test('shows warning if local commit.template is used', t => {
  addAuthor('John Doe', 'jdoe@example.com');

  exec('git config --local commit.template ".git/.gitmessage"');
  const actual = exec('git mob').stdout.trimEnd();
  const expected = /Warning: Git Mob uses Git global config/;

  t.regex(actual, expected);
  exec('git config --local --remove-section commit');
});

test('hides warning if local git mob config template is used true', t => {
  addAuthor('John Doe', 'jdoe@example.com');
  exec('git config --local commit.template ".git/.gitmessage"');
  exec('git config --local git-mob-config.use-local-template true');

  const actual = exec('git mob').stdout.trimEnd();
  const expected = /Warning: Git Mob uses Git global config/;

  t.notRegex(actual, expected);
  exec('git config --local --remove-section git-mob-config');
  exec('git config --local --remove-section commit');
});

test('update local commit template if using one', t => {
  addAuthor('John Doe', 'jdoe@example.com');
  addCoAuthor('Elliot Alderson', 'ealderson@findmypast.com');

  exec('git config --local commit.template ".git/.gitmessage"');

  exec('git mob').stdout.trimEnd();
  const actualGitMessage = readGitMessageFile();
  const expectedGitMessage = auto(
    [EOL, EOL, 'Co-authored-by: Elliot Alderson <ealderson@findmypast.com>'].join('')
  );

  t.is(actualGitMessage, expectedGitMessage);
  exec('git config --local --remove-section commit');
});

test('sets mob when co-author initials found', t => {
  addAuthor('Billy the Kid', 'billy@example.com');

  const actual = exec('git mob jd ea').stdout.trimEnd();
  const expected = stripIndent`
    Billy the Kid <billy@example.com>
    Jane Doe <jane@findmypast.com>
    Elliot Alderson <ealderson@findmypast.com>
  `;

  t.is(actual, expected);
  removeCoAuthors();
});

test('sets mob and override primary author', t => {
  addAuthor('Billy the Kid', 'billy@example.com');

  const actual = exec('git mob -o jd ea').stdout.trimEnd();
  const expected = stripIndent`
    Jane Doe <jane@findmypast.com>
    Elliot Alderson <ealderson@findmypast.com>
  `;

  t.is(actual, expected);
  removeCoAuthors();
});

test('Incorrect override author key will show error', t => {
  addAuthor('Billy the Kid', 'billy@example.com');

  const error =
    t.throws(() => {
      exec('git mob -o kl ea');
    }) || new Error('No error');

  t.regex(error.message, /error: kl author key not found!/i);
});

test('overwrites old mob when setting a new mob', t => {
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
  const expectedGitmessage = auto(stripIndent`
    A commit title

    A commit body that goes into more detail.

    Co-authored-by: Elliot Alderson <ealderson@findmypast.com>`);

  t.is(actualGitmessage, expectedGitmessage);
  removeCoAuthors();
});

test('appends co-authors to an existing commit template', t => {
  setGitMessageFile();
  addAuthor('Thomas Anderson', 'neo@example.com');

  exec('git mob jd ea');

  const actualGitMessage = readGitMessageFile();
  const expectedGitMessage = auto(stripIndent`
    A commit title

    A commit body that goes into more detail.

    Co-authored-by: Jane Doe <jane@findmypast.com>
    Co-authored-by: Elliot Alderson <ealderson@findmypast.com>`);

  t.is(actualGitMessage, expectedGitMessage);

  unsetCommitTemplate();
  removeCoAuthors();
});

test('appends co-authors to a new commit template', t => {
  deleteGitMessageFile();
  addAuthor('Thomas Anderson', 'neo@example.com');

  exec('git mob jd ea');

  const actualGitMessage = readGitMessageFile();
  const expectedGitMessage = auto(
    [
      EOL,
      EOL,
      'Co-authored-by: Jane Doe <jane@findmypast.com>',
      EOL,
      'Co-authored-by: Elliot Alderson <ealderson@findmypast.com>',
    ].join('')
  );

  t.is(actualGitMessage, expectedGitMessage);

  removeCoAuthors();
  unsetCommitTemplate();
});

test('warns when used outside of a git repo', t => {
  const repoDir = process.cwd();
  const temporaryDir = temporaryDirectory();
  process.chdir(temporaryDir);

  const error =
    t.throws(() => {
      exec('git mob');
    }) || new Error('No error');

  t.regex(error.message, /not a git repository/i);

  process.chdir(repoDir);
});
