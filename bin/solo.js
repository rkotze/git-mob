#! /usr/bin/env node

const path = require('path');
const { spawnSync } = require('child_process');
const minimist = require('minimist');
const { oneLine } = require('common-tags');
const { runHelp, runVersion } = require('../helpers');
const { gitMessage } = require('../git-message');

const gitMessagePath =
  process.env.GITMOB_MESSAGE_PATH ||
  commitTemplatePath() ||
  path.join('.git', '.gitmessage');

function commitTemplatePath() {
  return silentRun('git config commit.template').stdout.trim();
}

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

runSolo(argv._);

function runSolo(args) {
  if (args.length === 0) {
    gitMessage(gitMessagePath)
      .removeCoAuthors()
      .then(() => {
        // todo: unset git-mob.co-authors
        printAuthor();
        process.exit(0);
      })
      .catch(err => {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      });
  }
}

function printAuthor() {
  console.log(author());
}

function author() {
  const name = silentRun('git config user.name').stdout.trim();
  const email = silentRun('git config user.email').stdout.trim();
  return oneLine`${name} <${email}>`;
}

function silentRun(command) {
  return spawnSync(command, { encoding: 'utf8', shell: true });
}
