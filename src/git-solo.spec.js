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
