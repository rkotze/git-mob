#! /usr/bin/env node
const os = require('os');
const minimist = require('minimist');
const { oneLine } = require('common-tags');

const { config, revParse } = require('../src/git-commands');
const { gitAuthors } = require('../src/git-authors');
const { installTempate, uninstallTemplate } = require('../src/mob-template');
const {
  gitMessage,
  gitMessagePath,
  commitTemplatePath,
  prepareCommitMsgTemplate,
} = require('../src/git-message');
const {
  checkForUpdates,
  runHelp,
  runVersion,
  printList,
} = require('../src/helpers');
const { configWarning } = require('../src/check-author');
const { RED } = require('../src/constants');

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

  if (args.installTemplate) {
    try {
      await installTempate();
      console.log(
        'Installed git mob template ready for prepare-commit-msg.' +
          os.EOL +
          'See git-mob readme for further instuction.'
      );
      process.exit(0);
    } catch (ex) {
      console.error(ex.message);
      process.exit(1);
    }
  }

  if (args.uninstallTemplate) {
    try {
      await uninstallTemplate();
      console.log(
        'Uninstalled git mob template.' +
          os.EOL +
          'Update your prepare-commit-msg hook respectively.'
      );
      process.exit(0);
    } catch (ex) {
      console.error(ex.message);
      process.exit(1);
    }
  }

  if (!revParse.insideWorkTree()) {
    console.error('Error: not a git repository');
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
    console.log(coauthors());
  }

  if (configWarning(gitAuthor)) {
    console.warn(RED, configWarning(gitAuthor));
  }
}

async function listCoAuthors() {
  try {
    const instance = gitAuthors();
    const authorList = await instance.read();
    const coAuthors = instance.toList(authorList);

    printList(coAuthors);
  } catch (err) {
    console.error(`Error: ${err.message}`);
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

    coauthors.forEach(addCoAuthor);
    gitMessage(prepareCommitMsgTemplate() || gitMessagePath()).writeCoAuthors(
      coauthors
    );

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

function getGitAuthor() {
  const name = config.get('user.name');
  const email = config.get('user.email');
  return { name, email };
}

function author({ name, email }) {
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
