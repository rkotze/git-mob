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
const { RED } = require('../src/constants');

checkForUpdates();

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version',
    l: 'list',
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

  runMob(args._);
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

  printConfigWarning();
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

function author() {
  const name = config.get('user.name');
  const email = config.get('user.email');
  return oneLine`${name} <${email}>`;
}

function printConfigWarning() {
  const name = config.get('user.name');
  const email = config.get('user.email');
  if (name === '' || email === '') {
    console.warn(
      RED,
      'Warning: Missing information for the primary author. Set with:'
    );
  }
  if (name === '') {
    console.warn('$ git config --global user.name "Jane Doe"');
  }
  if (email === '') {
    console.warn('$ git config --global user.email "jane@example.com"');
  }
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
