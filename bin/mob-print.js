#! /usr/bin/env node
const minimist = require('minimist');
const { gitAuthors } = require('../src/git-authors');
const { gitMessage, prepareCommitMsgTemplate } = require('../src/git-message');
const { config } = require('../src/git-commands');
const { runMobPrintHelp } = require('../src/helpers');

const argv = minimist(process.argv.slice(2), {
  alias: {
    i: 'initials',
    h: 'help',
  },
});

execute(argv);

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
    const coAuthors = await gitMessage(prepareCommitMsgTemplate()).readCoAuthors();
    console.log(coAuthors);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function printCoAuthorsInitials() {
  try {
    const instance = gitAuthors();
    const authorList = await instance.read();
    const currentCoAuthors = config.getAll('git-mob.co-author');

    const coAuthorsInitials = instance.coAuthorsInitials(
      authorList,
      currentCoAuthors
    );
    if (coAuthorsInitials.length > 0) {
      console.log(coAuthorsInitials.join(','));
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
