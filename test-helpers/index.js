const fs = require('fs');
const { spawnSync } = require('child_process');
const { stripIndent } = require('common-tags');

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

function deleteGitMessageFile() {
  try {
    fs.unlinkSync(process.env.GITMOB_MESSAGE_PATH);
  } catch (error) {
    console.warn('Failed to delete .gitmessage file.', error.message);
  }
}

function exec(command) {
  return spawnSync(command, { encoding: 'utf8', shell: true });
}

module.exports = {
  addAuthor,
  removeAuthor,
  addCoAuthor,
  removeCoAuthors,
  unsetCommitTemplate,
  safelyRemoveGitConfigSection,
  removeGitConfigSection,
  setGitMessageFile,
  deleteGitMessageFile,
  exec,
};
