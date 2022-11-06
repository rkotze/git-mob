const { silentRun } = require("./silent-run");

/**
 * Computes the path to the top-level directory of the git repository.
 * @returns {string} Path to the top-level directory of the git repository.
 */
function topLevelDirectory() {
  return silentRun("git rev-parse --show-toplevel").stdout.trim();
}

/**
 * Checks if the current working directory is inside the working tree of a git repository.
 * @returns {boolean} Is the cwd in a git repository?
 */
function insideWorkTree() {
  return silentRun("git rev-parse --is-inside-work-tree").status === 0;
}

module.exports = {
  topLevelDirectory,
  insideWorkTree,
};
