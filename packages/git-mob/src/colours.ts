const colours = {
  red: '\u001B[31m',
  yellow: '\u001B[33m',
};
const reset = '\u001B[0m';

function red(text: string) {
  return colours.red + text + reset;
}

function yellow(text: string) {
  return colours.yellow + text + reset;
}

export { red, yellow };
