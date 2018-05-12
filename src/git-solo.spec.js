import test from 'ava';
import { stripIndent } from 'common-tags';
import eol from 'eol';
import tempy from 'tempy';

import {
  addAuthor,
  removeAuthor,
  removeCoAuthors,
  unsetCommitTemplate,
  safelyRemoveGitConfigSection,
  removeGitConfigSection,
  setGitMessageFile,
  readGitMessageFile,
  deleteGitMessageFile,
  exec,
} from '../test-helpers';

test.afterEach.always('cleanup', () => {
  removeAuthor();
  removeCoAuthors();
  removeGitConfigSection('git-mob');
  safelyRemoveGitConfigSection('user');
  safelyRemoveGitConfigSection('commit');
});

test.after.always('cleanup', () => {
  deleteGitMessageFile();
});

test('sets the current mob to the primary author', t => {
  addAuthor('Thomas Anderson', 'neo@example.com');
  setGitMessageFile();

  exec('git mob jd ea');

  const soloActual = exec('git solo').stdout.trimRight();
  const soloExpected = 'Thomas Anderson <neo@example.com>';

  const mobActual = exec('git mob').stdout.trimRight();
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

  const soloActual = exec('git solo yolo').stdout.trimRight();
  const soloExpected = 'Thomas Anderson <neo@example.com>';

  t.is(soloActual, soloExpected);
});

test('warns when used outside of a git repo', t => {
  const repoDir = process.cwd();
  const tempDir = tempy.directory();
  process.chdir(tempDir);

  const { stderr, status } = exec('git solo');

  t.regex(stderr, /not a git repository/i);
  t.not(status, 0);

  process.chdir(repoDir);
});
