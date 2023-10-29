import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { stripIndent } from 'common-tags';
import eol from 'eol';

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

function globalCommitTemplate() {
  const tempGlobal = path.join(process.cwd(), '.gitglobalmessage');
  exec(`git config --global --add commit.template ${tempGlobal}`);
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
    writeNewFile(process.env.GITMOB_MESSAGE_PATH, commitMessageTemplate);
  } catch (error) {
    console.warn('Failed to create .gitmessage file.', error.message);
  }
}

function writeNewFile(filePath, text) {
  try {
    fs.writeFileSync(filePath, text);
  } catch (error) {
    console.warn(`Failed to create ${filePath} file.`, error.message);
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
    console.warn(
      'Test Helpers: Failed to create global .git-coauthors file.',
      error.message
    );
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
  deleteFile(process.env.GITMOB_COAUTHORS_PATH);
}

function deleteGitMessageFile() {
  const filePath = process.env.GITMOB_MESSAGE_PATH;
  deleteFile(filePath);
}

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(
      `Test helpers: Failed to delete global ${filePath} file.`,
      error.message
    );
  }
}

function exec(command) {
  const spawnString = spawnSync(command, { encoding: 'utf8', shell: true });

  if (spawnString.status !== 0) {
    throw new Error(`GitMob test helper: "${command}" 
    stdout: ${spawnString.stdout}
    ---
    stderr: ${spawnString.stderr}`);
  }

  return spawnString;
}

const testDir = process.env.GITMOB_TEST_ENV_FOLDER;
const coAuthorsFilename = '.git-coauthors';

function setLocalCoauthorsFile() {
  try {
    const coauthorsTemplate = stripIndent`
    {
      "coauthors": {
        "dd": {
          "name": "Din Djarin",
          "email": "din@mando.com"
        },
        "bk": {
          "name": "Bo-Katan Kryze",
          "email": "bo-katan@dwatch.com"
        }
      }
    }
    `;
    fs.writeFileSync(
      path.join(process.env.HOME, testDir, coAuthorsFilename),
      coauthorsTemplate
    );
  } catch (error) {
    console.warn(
      'Test Helpers: Failed to create local .git-coauthors file.',
      error.message
    );
  }
}

function deleteLocalCoauthorsFile() {
  const filePath = path.join(process.env.HOME, testDir, coAuthorsFilename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(
      'Test helpers: Failed to delete local .git-coauthors file.',
      error.message
    );
  }
}

function setup() {
  process.chdir(process.env.GITMOB_TEST_HELPER_FOLDER);
  try {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
  } catch (error) {
    console.log(error);
  }
  writeNewFile(process.env.GITMOB_GLOBAL_MESSAGE_PATH, '');
  globalCommitTemplate();
  process.chdir(testDir);
  exec('git init -q');
}

function tearDown() {
  safelyRemoveGitConfigSection('commit');
  deleteFile(process.env.GITMOB_GLOBAL_MESSAGE_PATH);
  process.chdir(process.env.HOME);
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
  setLocalCoauthorsFile,
  readCoauthorsFile,
  deleteGitMessageFile,
  deleteCoauthorsFile,
  deleteLocalCoauthorsFile,
  exec,
  retainLocalAuthor,
  setup,
  tearDown,
};
