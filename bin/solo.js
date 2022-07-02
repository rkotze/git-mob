#! /usr/bin/env node

const minimist = require('minimist');
const { oneLine } = require('common-tags');

const { revParse, config } = require('../src/git-commands');
const {
  gitMessage,
  gitMessagePath,
} = require('../src/git-message');
const { checkForUpdates, runHelp, runVersion } = require('../src/helpers');
const { getGitAuthor, resetMob } = require('../src/git-mob-commands');

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
    await gitMessage(gitMessagePath()
    ).removeCoAuthors();

    if (config.usingLocalTemplate() && config.usingGlobalTemplate()) {
      gitMessage(config.getGlobalTemplate()).removeCoAuthors();
    }

    resetMob();
    printAuthor();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function printAuthor() {
  console.log(author());
}

function author() {
  const { name, email } = getGitAuthor();
  return oneLine`${name} <${email}>`;
}

