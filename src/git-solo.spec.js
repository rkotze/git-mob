const test = require('ava');
const { stripIndent } = require('common-tags');
const eol = require('eol');
const tempy = require('tempy');

const {
  addAuthor,
  removeCoAuthors,
  unsetCommitTemplate,
  safelyRemoveGitConfigSection,
  setGitMessageFile,
  readGitMessageFile,
  deleteGitMessageFile,
  exec,
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
  safelyRemoveGitConfigSection('git-mob');
  safelyRemoveGitConfigSection('user');
  safelyRemoveGitConfigSection('commit');
});

test('sets the current mob to the primary author', t => {
  addAuthor('Thomas Anderson', 'neo@example.com');
  setGitMessageFile();

  exec('git mob jd ea');

  const soloActual = exec('git solo').stdout.trimEnd();
  const soloExpected = 'Thomas Anderson <neo@example.com>';

  const mobActual = exec('git mob').stdout.trimEnd();
  const mobExpected = 'Thomas Anderson <neo@example.com>';

  t.is(soloActual, soloExpected);
  t.is(mobActual, mobExpected);

  unsetCommitTemplate();
});

test('removes co-authors from commit template', t => {
  addAuthor('Thomas Anderson', 'neo@example.com');
  setGitMessageFile();

  exec('git mob jd ea');
  exec('git solo');

  const actualGitMessage = readGitMessageFile();
  const expectedGitMessage = eol.auto(stripIndent`
    A commit title

    A commit body that goes into more detail.`);

  t.is(actualGitMessage, expectedGitMessage);

  unsetCommitTemplate();
});

test('ignores positional arguments', t => {
  addAuthor('Thomas Anderson', 'neo@example.com');

  const soloActual = exec('git solo yolo').stdout.trimEnd();
  const soloExpected = 'Thomas Anderson <neo@example.com>';

  t.is(soloActual, soloExpected);
});

test('warns when used outside of a git repo', t => {
  const repoDir = process.cwd();
  const temporaryDir = tempy.directory();
  process.chdir(temporaryDir);

  const { stderr, status } = exec('git solo');

  t.regex(stderr, /not a git repository/i);
  t.not(status, 0);

  process.chdir(repoDir);
});
