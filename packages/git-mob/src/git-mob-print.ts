import os from 'node:os';
import minimist from 'minimist';
import { getAllAuthors, getSelectedCoAuthors } from 'git-mob-core';
import { runMobPrintHelp } from './helpers.js';

const argv = minimist(process.argv.slice(2), {
  alias: {
    i: 'initials',
    h: 'help',
  },
});

await execute(argv);

async function execute(args: minimist.ParsedArgs) {
  if (args.help) {
    runMobPrintHelp();
    process.exit(0);
  }

  if (args.initials) {
    return printCoAuthorsInitials();
  }

  return printCoAuthors();
}

async function listSelectedAuthors() {
  const allAuthors = await getAllAuthors();
  return getSelectedCoAuthors(allAuthors);
}

async function printCoAuthors() {
  try {
    const selectedAuthors = await listSelectedAuthors();
    const coAuthors = selectedAuthors.map(author => author.format()).join(os.EOL);
    console.log(os.EOL + os.EOL + coAuthors);
  } catch (error: unknown) {
    const printError = error as Error;
    console.error(`Error: ${printError.message}`);
    process.exit(1);
  }
}

async function printCoAuthorsInitials() {
  try {
    const selectedAuthors = await listSelectedAuthors();

    if (selectedAuthors.length > 0) {
      console.log(selectedAuthors.map(author => author.key).join(','));
    }
  } catch (error: unknown) {
    const initialsError = error as Error;
    console.error(`Error: ${initialsError.message}`);
    process.exit(1);
  }
}
