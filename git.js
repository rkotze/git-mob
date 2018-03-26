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
 * @param {string} commmand
 * @returns {ChildProcess.SpawnResult} object from child_process.spawnSync
 */
function silentRun(command) {
  return spawnSync(command, { encoding: 'utf8', shell: true });
}

/**
 * Gets the (last) value for the given option key.
 * @param {string} key
 * @returns {string} Option value when present, otherwise empty string.
 */
function get(key) {
  return silentRun(`git config --get ${key}`).stdout.trim();
}

/**
 * Gets all values for a multi-valued option key.
 * @param {string} key
 * @returns {string} Option values when present, otherwise empty string.
 */
function getAll(key) {
  return silentRun(`git config --get-all ${key}`).stdout.trim();
}

/**
 * Sets the option, overwriting the existing value if one exists.
 * @param {string} key
 * @param {string} value
 * @throws Raises an Error if multiple values exist for the option.
 */
function set(key, value) {
  const { status } = silentRun(`git config ${key} "${value}"`);
  if (status !== 0) {
    const msg = `Option ${key} has multiple values. Cannot overwrite multiple values for option ${key} with a single value.`;
    throw Error(msg);
  }
}

/**
 * Adds a new line to the option without altering any existing values.
 * @param {string} key
 * @param {string} value
 */
function add(key, value) {
  silentRun(`git config --add ${key} "${value}"`);
}

/**
 * Checks if the given option exists in the configuration.
 * @param {string} key
 * @returns {boolean}
 */
function has(key) {
  return silentRun(`git config ${key}`).status === 0;
}

/**
 * Removes the given section from the configuration.
 * @param {string} section
 */
function removeSection(section) {
  silentRun(`git config --remove-section ${section}`);
}

module.exports = {
  config: {
    set,
    get,
    getAll,
    add,
    has,
    removeSection,
  },
};
