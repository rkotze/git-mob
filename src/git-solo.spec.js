import fs from 'fs';
import test from 'ava';
import { stripIndent } from 'common-tags';
import eol from 'eol';

import {
  addAuthor,
  removeAuthor,
  removeCoAuthors,
  unsetCommitTemplate,
  safelyRemoveGitConfigSection,
  removeGitConfigSection,
  setGitMessageFile,
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

test.serial('sets the current mob to the primary author', t => {
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

test.serial('removes co-authors from commit template', t => {
  addAuthor('Thomas Anderson', 'neo@example.com');
  setGitMessageFile();

  exec('git mob jd ea');
  exec('git solo');

  const actual = eol.auto(fs.readFileSync(process.env.GITMOB_MESSAGE_PATH, 'utf-8'));
  const expected = eol.auto(stripIndent`
    A commit title

    A commit body that goes into more detail.`);

  t.is(actual, expected);

  unsetCommitTemplate();
});
