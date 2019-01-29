#! /usr/bin/env node
const minimist = require('minimist');
const { runDeleteCoauthorHelp } = require('../src/helpers');
const { deleteCoauthor } = require('../src/manage-authors/delete-coauthor');

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
  },
});

async function execute(argv) {
  if (argv.help) {
    runDeleteCoauthorHelp();
    process.exit(0);
  }

  const args = argv._;

  if (args.length === 0) {
    console.error(
      'Please provide the initials of who you want deleting. Use -h to view examples.'
    );
  }

  await deleteCoauthor(args[0]);
  process.exit(0);
}

execute(argv);
