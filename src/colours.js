const RED = '\u001B[31m';
const YELLOW = '\u001B[33m';
const RESET = '\u001B[0m';

function red(text) {
  return RED + text + RESET;
}

function yellow(text) {
  return YELLOW + text + RESET;
}

module.exports = {
  red,
  yellow
};
