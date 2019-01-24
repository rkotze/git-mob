#! /usr/bin/env node
const minimist = require('minimist');
const { editCoauthor } = require('../src/manage-authors/edit-coauthor');

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
  },
});

async function execute(argv) {
  const args = argv._;

  await editCoauthor(args);
  process.exit(0);
}

execute(argv);
