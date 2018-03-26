#! /usr/bin/env node

const minimist = require('minimist');
const { oneLine } = require('common-tags');

const { config } = require('../git');
const { gitAuthors } = require('../git-authors');
const { gitMessage, gitMessagePath } = require('../git-message');
const { runHelp, runVersion } = require('../helpers');

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

runMob(argv._);

function runMob(args) {
  if (args.length === 0) {
    printMob();
  } else {
    setMob(args);
  }
}

function printMob() {
  console.log(author());

  if (isCoAuthorSet()) {
    console.log(coauthors());
  }
}

function setMob(initials) {
  const authors = gitAuthors();
  const message = gitMessage(gitMessagePath);
  authors
    .read()
    .then(authorList => authors.coAuthors(initials, authorList))
    .then(coAuthors => {
      setCommitTemplate();
      resetMob();
      coAuthors.forEach(addCoAuthorToGitConfig);
      message.writeCoAuthors(coAuthors);
      printMob();
    })
    .catch(err => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
}

function author() {
  const name = config.get('user.name');
  const email = config.get('user.email');
  return oneLine`${name} <${email}>`;
}

function coauthors() {
  return config.getAll('git-mob.co-author');
}

function isCoAuthorSet() {
  return config.has('git-mob.co-author');
}

function addCoAuthorToGitConfig(coAuthor) {
  config.add('git-mob.co-author', coAuthor);
}

function resetMob() {
  config.removeSection('git-mob');
}

function setCommitTemplate() {
  config.has('commit.template') || config.set('commit.template', gitMessagePath);
}
