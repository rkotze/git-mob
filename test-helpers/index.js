const fs = require('fs');
const { spawnSync } = require('child_process');
const { stripIndent } = require('common-tags');
const eol = require('eol');

function retainLocalAuthor() {
  const localName = exec('git config user.name').stdout.trim();
  const localEmail = exec('git config user.email').stdout.trim();
  return function () {
    if (localEmail && localName) {
      addAuthor(localName, localEmail);
    } else {
      removeAuthor();
    }
  };
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
  exec(`git config --global --add git-mob.co-author "${name} <${email}>"`);
}

function removeCoAuthors() {
  removeGitConfigSection('git-mob');
}

function unsetCommitTemplate() {
  removeGitConfigSection('commit');
}

function hasGitConfigSection(section) {
  try {
    const config = exec(`git config --get-regexp ${section}`);

    return config.status !== 0 && config.stdout.trimEnd().length > 0;
  } catch {
    return false;
  }
}

function safelyRemoveGitConfigSection(section) {
  if (hasGitConfigSection(section)) {
    removeGitConfigSection(section);
  }
}

function removeGitConfigSection(section) {
  exec(`git config --global --remove-section ${section}`);
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

function readGitMessageFile(noFile = false) {
  if (noFile && !fs.existsSync(process.env.GITMOB_MESSAGE_PATH)) {
    return undefined;
  }

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
    if (fs.existsSync(process.env.GITMOB_COAUTHORS_PATH)) {
      fs.unlinkSync(process.env.GITMOB_COAUTHORS_PATH);
    }
  } catch (error) {
    console.warn('Failed to delete .git-coauthors file.', error.message);
  }
}

function deleteGitMessageFile() {
  try {
    if (fs.existsSync(process.env.GITMOB_MESSAGE_PATH)) {
      fs.unlinkSync(process.env.GITMOB_MESSAGE_PATH);
    }
  } catch (error) {
    console.warn('Failed to delete .gitmessage file.', error.message);
  }
}

function exec(command) {
  const spawnString = spawnSync(command, { encoding: 'utf8', shell: true });

  if (spawnString.status !== 0) {
    throw new Error(`GitMob handleResponse: "${command}" 
    stdout: ${spawnString.stdout}
    ---
    stderr: ${spawnString.stderr}`);
  }

  return spawnString;
}

const testDir = './test-env';
const repoDir = process.cwd();
function setup() {
  try {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
  } catch (error) {
    console.log(error);
  }

  process.chdir(testDir);
  exec('git init -q');
}

function tearDown() {
  process.chdir(repoDir);
  /* eslint n/no-unsupported-features/node-builtins: 0 */
  fs.rmSync(testDir, { recursive: true });
}

export {
  addAuthor,
  removeAuthor,
  addCoAuthor,
  removeCoAuthors,
  unsetCommitTemplate,
  safelyRemoveGitConfigSection,
  setGitMessageFile,
  readGitMessageFile,
  setCoauthorsFile,
  readCoauthorsFile,
  deleteGitMessageFile,
  deleteCoauthorsFile,
  exec,
  retainLocalAuthor,
  setup,
  tearDown
};
