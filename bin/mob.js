#! /usr/bin/env node
const minimist = require('minimist');
const { oneLine, stripIndents } = require('common-tags');

const { config, revParse } = require('../src/git-commands');
const { gitAuthors } = require('../src/git-authors');
const {
  gitMessage,
  gitMessagePath,
  commitTemplatePath,
} = require('../src/git-message');
const {
  checkForUpdates,
  runHelp,
  runVersion,
  printList,
} = require('../src/helpers');
const { configWarning } = require('../src/check-author');
const { red, yellow } = require('../src/colours');
const { getCoAuthors, isCoAuthorSet, resetMob, addCoAuthor, getGitAuthor, setGitAuthor } = require('../src/git-mob-commands');

checkForUpdates();

const argv = minimist(process.argv.slice(2), {
  boolean: ['h', 'v', 'l', 'o'],

  alias: {
    h: 'help',
    v: 'version',
    l: 'list',
    o: 'override'
  },
});

execute(argv);

async function execute(args) {
  if (args.help) {
    runHelp();
    process.exit(0);
  }

  if (args.version) {
    runVersion();
    process.exit(0);
  }

  if (args.list) {
    await listCoAuthors();
    process.exit(0);
  }

  if (!revParse.insideWorkTree()) {
    console.error('Error: not a Git repository');
    process.exit(1);
  }

  if (args.override) {
    setAuthor(args._);
  } else {
    runMob(args._);
  }
}

function runMob(args) {
  if (args.length === 0) {
    printMob();
  } else {
    setMob(args);
  }
}

function printMob() {
  const gitAuthor = getGitAuthor();
  console.log(author(gitAuthor));

  if (isCoAuthorSet()) {
    console.log(getCoAuthors());
  }

  if (config.usingLocalTemplate()) {
    console.log(yellow(stripIndents`Warning: Git Mob uses Git global config.
    Using local commit.template could mean your template does not have selected co-authors appended after switching projects.
    See: https://github.com/rkotze/git-mob/discussions/81`));
  }

  if (configWarning(gitAuthor)) {
    console.warn(red(configWarning(gitAuthor)));
  }
}

async function listCoAuthors() {
  try {
    const instance = gitAuthors();
    const authorList = await instance.read();
    const coAuthors = instance.toList(authorList);

    printList(coAuthors);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function setMob(initials) {
  try {
    const instance = gitAuthors();
    const authorList = await instance.read();
    const coauthors = instance.coAuthors(initials, authorList);

    setCommitTemplate();
    resetMob();

    for (const coauthor of coauthors) {
      addCoAuthor(coauthor);
    }

    gitMessage(gitMessagePath()).writeCoAuthors(
      coauthors
    );

    if (config.usingLocalTemplate() && config.usingGlobalTemplate()) {
      gitMessage(config.getGlobalTemplate()).writeCoAuthors(
        coauthors
      );
    }

    printMob();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function setAuthor(initials) {
  try {
    const instance = gitAuthors();
    const authorList = await instance.read();
    const authors = instance.author(initials.shift(), authorList);

    setGitAuthor(authors.name, authors.email);
    runMob(initials);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function author({ name, email }) {
  return oneLine`${name} <${email}>`;
}

function setCommitTemplate() {
  if (!config.hasTemplatePath()) {
    config.setTemplatePath(commitTemplatePath());
  }
}
