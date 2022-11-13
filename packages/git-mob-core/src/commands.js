const { exec } = require('child_process');
const { promisify } = require('util');
const { silentRun } = require('./silent-run');

/**
 * Runs the given command in a shell.
 * @param {string} command The command to execute
 * @returns {Promise} stdout string
 */
async function silentExec(command) {
  const execAsync = promisify(exec);
  try {
    const response = await execAsync(command, cmdOptions());

    return response.stdout;
  } catch (error) {
    return `GitMob silentExec: "${command}" ${error.message}`;
  }
}

function handleResponse(query) {
  try {
    const response = silentRun(query);
    if (response.status !== 0) {
      return `GitMob handleResponse: "${query}" ${response.stderr.trim()}`;
    }

    return response.stdout.trim();
  } catch (error) {
    return `GitMob catch: "${query}" ${error.message}`;
  }
}

function getAll(key) {
  return handleResponse(`git config --get-all ${key}`);
}

function get(key) {
  return handleResponse(`git config --get ${key}`);
}

function has(key) {
  return silentRun(`git config ${key}`).status === 0;
}

function add(key, value) {
  return silentRun(`git config --add ${key} "${value}"`);
}

function usingLocalTemplate() {
  return has('--local commit.template');
}

// Sets the option, overwriting the existing value if one exists.
function set(key, value) {
  const { status } = silentRun(`git config ${key} "${value}"`);
  if (status !== 0) {
    const message = `Option ${key} has multiple values. Cannot overwrite multiple values for option ${key} with a single value.`;
    console.log(`GitMob set: ${message}`);
  }
}

function gitAddCoAuthor(coAuthor) {
  return add('--global git-mob.co-author', coAuthor);
}

async function getRepoAuthors() {
  return silentExec(`git shortlog -sen HEAD`);
}

function removeGitMobSection() {
  return silentRun(`git config --global --remove-section git-mob`);
}

function cmdOptions(extendOptions = {}) {
  return {
    ...extendOptions,
    encoding: 'utf8',
  };
}

module.exports = {
  config: {
    getAll,
    get,
    has,
    set,
  },
  mob: {
    removeGitMobSection,
    gitAddCoAuthor,
    usingLocalTemplate,
  },
  getRepoAuthors,
};
