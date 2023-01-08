import os from 'node:os';
import minimist from 'minimist';
import { oneLine, stripIndents } from 'common-tags';

import { getAllAuthors, getPrimaryAuthor } from 'git-mob-core';
import { config, revParse } from '../src/git-commands';
import { gitAuthors } from '../src/git-authors';
import { gitMessage, gitMessagePath, commitTemplatePath } from '../src/git-message';
import { checkForUpdates, runHelp, runVersion, printList } from '../src/helpers';
import { configWarning } from '../src/check-author';
import { red, yellow } from '../src/colours';
import {
  getCoAuthors,
  isCoAuthorSet,
  resetMob,
  addCoAuthor,
  setGitAuthor,
  mobConfig,
} from '../src/git-mob-commands';
import { composeAuthors } from './git-authors/compose-authors';

checkForUpdates();

const argv = minimist(process.argv.slice(2), {
  boolean: ['h', 'v', 'l', 'o'],

  alias: {
    h: 'help',
    v: 'version',
    l: 'list',
    o: 'override',
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
    if (config.usingLocalTemplate() && isCoAuthorSet()) {
      gitMessage(gitMessagePath()).writeCoAuthors(getCoAuthors().split(os.EOL));
    }
  } else {
    setMob(args);
  }
}

function printMob() {
  const gitAuthor = getPrimaryAuthor();
  console.log(author(gitAuthor));

  if (isCoAuthorSet()) {
    console.log(getCoAuthors());
  }

  if (!mobConfig.useLocalTemplate() && config.usingLocalTemplate()) {
    console.log(
      yellow(stripIndents`Warning: Git Mob uses Git global config.
    Using local commit.template could mean your template does not have selected co-authors appended after switching projects.
    See: https://github.com/rkotze/git-mob/discussions/81`)
    );
  }

  if (configWarning(gitAuthor)) {
    console.warn(red(configWarning(gitAuthor)));
  }
}

async function listCoAuthors() {
  try {
    const coAuthors = await getAllAuthors();

    printList(coAuthors);
  } catch (error) {
    console.error(red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function setMob(initials) {
  try {
    const instance = gitAuthors();
    const authorList = await instance.read();
    const coauthors = await composeAuthors(initials, authorList.coauthors);

    setCommitTemplate();
    resetMob();

    for (const coauthor of coauthors) {
      addCoAuthor(coauthor);
    }

    gitMessage(gitMessagePath()).writeCoAuthors(coauthors);

    if (config.usingLocalTemplate() && config.usingGlobalTemplate()) {
      gitMessage(config.getGlobalTemplate()).writeCoAuthors(coauthors);
    }

    printMob();
  } catch (error) {
    console.error(red(`Error: ${error.message}`));
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
    console.error(red(`Error: ${error.message}`));
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
