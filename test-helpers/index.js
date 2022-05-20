const fs = require('fs');
const { spawnSync } = require('child_process');
const { stripIndent } = require('common-tags');
const eol = require('eol');

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
    const commitMessageTemplate = stripIndent`
      A commit title

      A commit body that goes into more detail.
    `;
    fs.writeFileSync(process.env.GITMOB_MESSAGE_PATH, commitMessageTemplate);
  } catch (error) {
    console.warn('Failed to create .gitmessage file.', error.message);
  }
}

function readGitMessageFile() {
  try {
    return eol.auto(fs.readFileSync(process.env.GITMOB_MESSAGE_PATH, 'utf8'));
  } catch (error) {
    console.warn('Failed to read .gitmessage file.', error.message);
  }
}

function setCoauthorsFile() {
  try {
    const coauthorsTemplate = stripIndent`
    {
      "coauthors": {
        "jd": {
          "name": "Jane Doe",
          "email": "jane@findmypast.com"
        },
        "fb": {
          "name": "Frances Bar",
          "email": "frances-bar@findmypast.com"
        },
        "ea": {
          "name": "Elliot Alderson",
          "email": "ealderson@findmypast.com"
        }
      }
    }
    `;
    fs.writeFileSync(process.env.GITMOB_COAUTHORS_PATH, coauthorsTemplate);
  } catch (error) {
    console.warn('Failed to create .git-coauthors file.', error.message);
  }
}

function readCoauthorsFile() {
  try {
    return eol.auto(fs.readFileSync(process.env.GITMOB_COAUTHORS_PATH, 'utf8'));
  } catch (error) {
    console.warn('Failed to read .git-coauthors file.', error.message);
  }
}

function deleteCoauthorsFile() {
  try {
    fs.unlinkSync(process.env.GITMOB_COAUTHORS_PATH);
  } catch (error) {
    console.warn('Failed to delete .git-coauthors file.', error.message);
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
  readGitMessageFile,
  setCoauthorsFile,
  readCoauthorsFile,
  deleteGitMessageFile,
  deleteCoauthorsFile,
  exec,
};
