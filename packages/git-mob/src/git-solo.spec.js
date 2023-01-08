import test, { before, after } from 'ava';
import { stripIndent } from 'common-tags';
import { auto } from 'eol';
import { temporaryDirectory } from 'tempy';

import {
  addAuthor,
  unsetCommitTemplate,
  setGitMessageFile,
  readGitMessageFile,
  deleteGitMessageFile,
  exec,
  setCoauthorsFile,
  deleteCoauthorsFile,
  setup,
  tearDown,
} from '../test-helpers';

before('Check author', () => {
  setup();
  setCoauthorsFile();
});

after.always('cleanup', () => {
  tearDown();
  deleteCoauthorsFile();
  deleteGitMessageFile();
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
  const expectedGitMessage = auto(stripIndent`
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
  const temporaryDir = temporaryDirectory();
  process.chdir(temporaryDir);

  const error = t.throws(() => {
    exec('git solo');
  });

  t.regex(error.message, /not a git repository/i);

  process.chdir(repoDir);
});
