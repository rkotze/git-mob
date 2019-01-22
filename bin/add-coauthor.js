#! /usr/bin/env node
const minimist = require('minimist');
const { runAddCoauthorHelp, validateEmail } = require('../src/helpers');
const { addCoauthor } = require('../src/manage-authors/add-coauthor');

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
  },
});

async function execute(argv) {
  if (argv.help) {
    runAddCoauthorHelp();
    process.exit(0);
  }

  const args = argv._;

  if (args.length !== 3) {
    console.log('Incorrect Number of Parameters');
    process.exit(0);
  }
  if (validateEmail(args[2]) === false) {
    console.log('Invalid Email Format');
    process.exit(0);
  }

  await addCoauthor(args);
}

execute(argv);
