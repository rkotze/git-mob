const { spawnSync } = require('child_process');
const { getConfig } = require('./config-manager');

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
  const cmdConfig = { shell: true };
  const processCwd = getConfig('processCwd');
  if (processCwd) cmdConfig.cwd = processCwd;
  return spawnSync(command, cmdOptions(cmdConfig));
}

function cmdOptions(extendOptions = {}) {
  return {
    ...extendOptions,
    encoding: 'utf8',
  };
}

exports.silentRun = silentRun;
