#! /usr/bin/env node

const minimist = require('minimist');
const shell = require('shelljs');

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
  },
});

if (argv.help) {
  runHelp();
}
if (argv.version) {
  runVersion();
}
// TODO: Handle "not found" scenario in runMob()
// I was thinking throwing the error from git-authors/index
// Lets discuss in keybase team chat
if (argv._.length > 0) {
  console.log(`
    Error:
    - Author ${argv._[0]} initials not found.
    - Please add to ~/.git-authors file.
  `);
  shell.exit(1);
}

runMob(argv._);

function runHelp() {
  console.log(`
Usage
  $ git mob <co-author-initials>
  $ git solo

Options
  -h  Prints usage information
  -v  Prints current version

Examples
  $ git mob jd  # Set John Doe is co-author
  $ git mob jd am  # Set John and Amy as co-authors
  $ git solo  # Go back to soloing
  `);
  shell.exit(0);
}

function runVersion() {
  console.log(require('../package.json').version);
}

function runMob(args) {
  if (args.length === 0) {
    readMob();
  }
}

function readMob() {
  shell.exec('git config git-mob.co-author');
}
