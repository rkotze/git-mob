#! /usr/bin/env node

const minimist = require('minimist');
const shell = require('shelljs');
const { stripIndent, oneLine } = require('common-tags');
const { gitAuthors } = require('../git-authors');

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

  // TODO: Handle "not found" scenario in runMob()
  if (args.length > 0) {
    const authors = gitAuthors();
    authors
      .read()
      .then(authorList => {
        return authors.coAuthors(args, authorList);
      })
      .then(coAuthors => {
        coAuthors.forEach(addCoAuthor);
        printMob();
      })
      .catch(err => {
        console.log(`
          Error:
          ${err.message}
        `);
        shell.exit(1);
      });
  }
}

function printMob() {
  console.log(author());

  if (isCoAuthorSet()) {
    console.log(coauthors());
  }
}

function author() {
  const name = silentRun('git config user.name').stdout.trim();
  const email = silentRun('git config user.email').stdout.trim();
  return oneLine`${name} <${email}>`;
}

function coauthors() {
  return silentRun('git config --get-all git-mob.co-author').stdout.trim();
}

function isCoAuthorSet() {
  const { code } = silentRun('git config git-mob.co-author');
  return code === 0;
}

function silentRun(command) {
  return shell.exec(command, { silent: true });
}

function addCoAuthor(coAuthor) {
  return silentRun(`git config --add git-mob.co-author "${coAuthor}"`);
}
