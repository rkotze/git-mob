import minimist from 'minimist';
import { getPrimaryAuthor, solo } from 'git-mob-core';

import { revParse } from './git-commands.js';
import { checkForUpdates, runHelp, runVersion } from './helpers.js';

checkForUpdates();

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
  },
});

if (argv.help) {
  runHelp();
  process.exit(0);
}

if (argv.version) {
  runVersion();
  process.exit(0);
}

if (!revParse.insideWorkTree()) {
  console.error('Error: not a git repository');
  process.exit(1);
}

runSolo();

async function runSolo() {
  try {
    await solo();
    printAuthor();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function printAuthor() {
  const author = getPrimaryAuthor();
  console.log(author.toString());
}
