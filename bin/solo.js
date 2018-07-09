#! /usr/bin/env node

const minimist = require('minimist');
const { oneLine } = require('common-tags');

const { config, revParse } = require('../src/git-commands');
const { gitMessage, gitMessagePath } = require('../src/git-message');
const { checkForUpdates, runHelp, runVersion } = require('../src/helpers');

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

runSolo(argv._);

async function runSolo(_args) {
  try {
    await gitMessage(gitMessagePath()).removeCoAuthors();
    resetMob();
    printAuthor();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function printAuthor() {
  console.log(author());
}

function author() {
  const name = config.get('user.name');
  const email = config.get('user.email');
  return oneLine`${name} <${email}>`;
}

function resetMob() {
  config.removeSection('git-mob');
}
