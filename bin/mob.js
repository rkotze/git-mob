#! /usr/bin/env node

const minimist = require('minimist');
const shell = require('shelljs');
const { stripIndent, oneLine } = require('common-tags');

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
  },
});

if (argv.help) {
  runHelp();
  shell.exit(0);
}
if (argv.version) {
  runVersion();
  shell.exit(0);
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
  const message = stripIndent`
    Usage
      $ git mob <co-author-initials>
      $ git solo

    Options
      -h  Prints usage information
      -v  Prints current version

    Examples
      $ git mob jd     # Set John Doe as co-author
      $ git mob jd am  # Set John & Amy as co-authors
      $ git solo       # Dissipate the mob
  `;
  console.log(message);
}

function runVersion() {
  console.log(require('../package.json').version);
}

function runMob(args) {
  if (args.length === 0) {
    printMob();
  }
}

function printMob() {
  console.log(author());
  console.log(coauthors());
}

function author() {
  const name = silentRun('git config user.name');
  const email = silentRun('git config user.email');
  return oneLine`${name} <${email}>`;
}

function coauthors() {
  return silentRun('git config --get-all git-mob.co-author');
}

function silentRun(command) {
  return shell.exec(command, { silent: true }).stdout.trim();
}
