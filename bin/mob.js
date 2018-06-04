#! /home/juanpablo/.nvm/versions/node/v8.11.2/bin/node --inspect-brk 
//#! /usr/bin/env node

const minimist = require('minimist');
const { oneLine } = require('common-tags');

const { config, revParse } = require('../src/git');
const { gitAuthors } = require('../src/git-authors');
const {
  gitMessage,
  gitMessagePath,
  commitTemplatePath,
} = require('../src/git-message');
const { checkForUpdates, runHelp, runVersion } = require('../src/helpers');

checkForUpdates();

const argv = minimist(process.argv.slice(2), {
  boolean: ['o', 'h', 'v'],

  alias: {
    h: 'help',
    v: 'version',
    o: 'override'
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

if (argv.override) {
  setAuthor(argv._);
} else {
  runMob(argv._);
}

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

async function setMob(initials) {
  try {
    const instance = gitAuthors();
    const authorList = await instance.read();
    const coauthors = instance.coAuthors(initials, authorList);

    setCommitTemplate();
    resetMob();

    coauthors.forEach(addCoAuthor);
    gitMessage(gitMessagePath()).writeCoAuthors(coauthors);

    printMob();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

async function setAuthor(initials) {
  try {
    const instance = gitAuthors();
    const authorList = await instance.read();
    const authors = instance.author(initials.shift(), authorList);

    config.set('user.name', authors.name);
    config.set('user.email', authors.email);
    runMob(initials);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
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

function addCoAuthor(coAuthor) {
  config.add('git-mob.co-author', coAuthor);
}

function resetMob() {
  config.removeSection('git-mob');
}

function setCommitTemplate() {
  if (!config.has('commit.template')) {
    config.set('commit.template', commitTemplatePath());
  }
}
