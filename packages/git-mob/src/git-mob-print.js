import os from 'node:os';
import minimist from 'minimist';
import { gitAuthors } from './git-authors/index.js';
import { runMobPrintHelp } from './helpers.js';
import { formatCoAuthorList } from './git-message/index.js';
import { getCoAuthors } from './git-mob-commands.js';

const argv = minimist(process.argv.slice(2), {
  alias: {
    i: 'initials',
    h: 'help',
  },
});

await execute(argv);

async function execute(args) {
  if (args.help) {
    runMobPrintHelp();
    process.exit(0);
  }

  if (args.initials) {
    await printCoAuthorsInitials();
    process.exit(0);
  }

  printCoAuthors();
}

async function printCoAuthors() {
  try {
    const coAuthors = formatCoAuthorList(
      getCoAuthors().split(os.EOL).filter(Boolean)
    );
    console.log(os.EOL + os.EOL + coAuthors);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function printCoAuthorsInitials() {
  try {
    const instance = gitAuthors();
    const authorList = await instance.read();
    const currentCoAuthors = getCoAuthors();

    const coAuthorsInitials = instance.coAuthorsInitials(
      authorList,
      currentCoAuthors
    );
    if (coAuthorsInitials.length > 0) {
      console.log(coAuthorsInitials.join(','));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
