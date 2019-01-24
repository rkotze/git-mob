#! /usr/bin/env node
const minimist = require('minimist');
const { runEditCoauthorHelp } = require('../src/helpers');
const { editCoauthor } = require('../src/manage-authors/edit-coauthor');

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
  },
});

async function execute(argv) {
  if (argv.help) {
    runEditCoauthorHelp();
    process.exit(0);
  }

  const args = argv._;

  await editCoauthor(args);
  process.exit(0);
}

execute(argv);
