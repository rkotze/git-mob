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

function silentRun(command) {
  return spawnSync(command, { encoding: 'utf8', shell: true });
}

/**
 * Gets the (last) value for the given key.
 * Exit code will be 1 when the key is not found.
 * @param {string} key
 * @return {ChildProcess.SpawnResult} object from child_process.spawnSync
 */
function get(key) {
  return silentRun(`git config --get ${key}`);
}

/**
 * Gets all values for a multi-valued key.
 * @param {string} key
 * @return {ChildProcess.SpawnResult} object from child_process.spawnSync
 */
function getAll(key) {
  return silentRun(`git config --get-all ${key}`);
}

/**
 * Sets the option, overwriting the existing value if one exists.
 * Errors if multiple values exist for the option.
 * @param {string} key
 * @param {string} value
 * @return {ChildProcess.SpawnResult} object from child_process.spawnSync
 */
function set(key, value) {
  return silentRun(`git config ${key} "${value}"`);
}

/**
 * Adds a new line to the option without altering any existing values.
 * @param {string} key
 * @param {string} value
 * @return {ChildProcess.SpawnResult} object from child_process.spawnSync
 */
function add(key, value) {
  return silentRun(`git config --add ${key} "${value}"`);
}

/**
 * Removes the given section from the configuration.
 * @param {string} section
 * @return {ChildProcess.SpawnResult} object from child_process.spawnSync
 */
function removeSection(section) {
  return silentRun(`git config --remove-section ${section}`);
}

/**
 * Checks if the given option exists in the configuration.
 * @param {string} key
 * @return {boolean}
 */
function hasOption(key) {
  return silentRun(`git config ${key}`).status === 0;
}

module.exports = {
  config: {
    set,
    get,
    getAll,
    add,
    removeSection,
    hasOption,
  },
};
