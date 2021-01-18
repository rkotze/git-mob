const { spawnSync } = require('child_process');

/**
 * @typedef {Object} ChildProcess.SpawnResult
 * @property {number} pid Process identification number of the child process
 * @property {Array} output Array of results from stdio output
 * @property {Buffer} stdout  The contents of output[1]
 * @property {Buffer} stderr The contents of output[2]
 * @property {number} status The exit code of the child process
 * @property {string} signal The signal used to kill the child process
 * @property {Error} error The error object if the child process failed or timed out
 */

/**
 * Runs the given command in a shell.
 * @param {string} command The command to execute
 * @returns {ChildProcess.SpawnResult} object from child_process.spawnSync
 */
function silentRun(command) {
  return spawnSync(command, { encoding: 'utf8', shell: true });
}

/**
 * Gets the (last) value for the given option key.
 * @param {string} key The configuration key in the form 'section.option'
 * @returns {string} Option value when present, otherwise empty string.
 */
function get(key) {
  return silentRun(`git config --get ${key}`).stdout.trim();
}

/**
 * Gets all values for a multi-valued option key.
 * @param {string} key The configuration key in the form 'section.option'
 * @returns {string} Option values when present, otherwise empty string.
 */
function getAll(key) {
  return silentRun(`git config --get-all ${key}`).stdout.trim();
}

/**
 * Sets the option, overwriting the existing value if one exists.
 * @param {string} key The configuration key in the form 'section.option'
 * @param {string} value
 * @throws Raises an Error if multiple values exist for the option.
 */
function set(key, value) {
  const { status } = silentRun(`git config ${key} "${value}"`);
  if (status !== 0) {
    const message = `Option ${key} has multiple values. Cannot overwrite multiple values for option ${key} with a single value.`;
    throw new Error(message);
  }
}

/**
 * Adds a new line to the option without altering any existing values.
 * @param {string} key The configuration key in the form 'section.option'
 * @param {string} value
 */
function add(key, value) {
  silentRun(`git config --add ${key} "${value}"`);
}

/**
 * Checks if the given option exists in the configuration.
 * @param {string} key The configuration key in the form 'section.option'
 * @returns {boolean} Is the key present in the git config?
 */
function has(key) {
  return silentRun(`git config ${key}`).status === 0;
}

/**
 * Removes the given section from the configuration.
 * @param {string} section The configuration section to remove.
 */
function removeSection(section) {
  silentRun(`git config --remove-section ${section}`);
}

/**
 * Resolves the given path to the .git directory.
 * Takes other path relocation variables into account, e.g.
 * https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables#_repository_locations
 * @param {string} path The file name or path to resolve.
 * @returns {string} Relative path to "$GIT_DIR/<path>"
 */
function gitPath(path) {
  const version = silentRun('git --version').stdout.trim();
  const [major, minor] = gitVersion(version);

  if (major >= 2 && minor >= 13) {
    return silentRun(`git rev-parse --git-path ${path}`).stdout.trim();
  }

  // Git pre-v2.13 does not give relative path to GIT_DIR for `rev-parse --git-path`.
  // Prefix relative path with `--show-cdup`.
  // Git release notes: https://github.com/git/git/blob/master/Documentation/RelNotes/2.13.0.txt#L71-L74
  const relativePath = silentRun(
    `git rev-parse --show-cdup && git rev-parse --git-path ${path}`
  ).stdout.trim();
  return relativePath.replace(/(\r\n|\r|\n)/, '');
}

/**
 * Extracts the git version into an array format.
 * @param {string} version a string containing a semver format
 * @returns {array} [major, minor, patch]
 */
function gitVersion(version) {
  const [, major, minor, patch] = /(\d)\.(\d*)\.(\d*)/gm.exec(version);
  return [major, minor, patch];
}

/**
 * Checks if the current working directory is inside the working tree of a git repository.
 * @returns {boolean} Is the cwd in a git repository?
 */
function insideWorkTree() {
  return silentRun('git rev-parse --is-inside-work-tree').status === 0;
}

/**
 * Computes the path to the top-level directory of the git repository.
 * @returns {string} Path to the top-level directory of the git repository.
 */
function topLevelDirectory() {
  return silentRun('git rev-parse --show-toplevel').stdout.trim();
}

/**
 * Returns a list of the existing authors for the git repository
 * including their names and email addresses
 * @returns {string} of output from git command
 */
function shortLogAuthorSummary() {
  return silentRun('git shortlog --summary --email --number HEAD').stdout.trim();
}

module.exports = {
  version: gitVersion,
  config: {
    set,
    get,
    getAll,
    add,
    has,
    removeSection,
  },
  revParse: {
    gitPath,
    insideWorkTree,
    topLevelDirectory,
  },
  authors: {
    shortLogAuthorSummary,
  },
};
