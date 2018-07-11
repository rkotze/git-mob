const fs = require('fs');
const { spawnSync } = require('child_process');
const { stripIndent } = require('common-tags');
const eol = require('eol');
const tempy = require('tempy');

function readFile(path) {
  try {
    return eol.auto(fs.readFileSync(path, 'utf-8'));
  } catch (error) {
    console.warn('Failed to read file.', error.message);
  }
}

function deleteFile(path) {
  try {
    fs.unlinkSync(path);
  } catch (error) {
    console.warn(`Failed to delete ${path}`, error.message);
  }
}

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
  return exec(`git config --local --get-regexp '^${section}'`).status !== 0;
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
    const commitMsgTemplate = stripIndent`
      A commit title

      A commit body that goes into more detail.
    `;
    fs.writeFileSync(process.env.GITMOB_MESSAGE_PATH, commitMsgTemplate);
  } catch (error) {
    console.warn('Failed to create .gitmessage file.', error.message);
  }
}

// TODO: Export generic readFile/1 deleteFile/1 and remove these.
function readGitMessageFile() {
  return readFile(process.env.GITMOB_MESSAGE_PATH);
}

function deleteGitMessageFile() {
  return deleteFile(process.env.GITMOB_MESSAGE_PATH);
}

function exec(command) {
  return spawnSync(command, { encoding: 'utf8', shell: true });
}

/**
 * Creates a temporary git repository for a callback.
 * @param {function} cb Callback to execute inside the git repo
 */
function gitRepo(cb) {
  const origPath = process.cwd();
  const repoPath = tempy.directory();
  process.chdir(repoPath);
  exec('git init');
  cb();
  process.chdir(origPath);
}

module.exports = {
  gitRepo,
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
};
