import os from 'node:os';
import minimist from 'minimist';
import { oneLine, stripIndents } from 'common-tags';

import {
  getAllAuthors,
  getPrimaryAuthor,
  getSelectedCoAuthors,
  gitMobConfig,
  gitConfig,
  gitRevParse,
  setCoAuthors,
  setPrimaryAuthor,
  updateGitTemplate,
} from 'git-mob-core';
import { checkForUpdates, runHelp, runVersion, printList } from '../src/helpers';
import { configWarning } from '../src/check-author';
import { red, yellow } from '../src/colours';
import { saveMissingAuthors } from './git-authors/save-missing-authors';

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

  if (!gitRevParse.insideWorkTree()) {
    console.error(red('Error: not a Git repository'));
    process.exit(1);
  }

  if (args.override) {
    const initial = args._.shift();
    await setAuthor(initial);
    await runMob(args._);
  } else {
    await runMob(args._);
  }
}

async function runMob(args) {
  if (args.length === 0) {
    const gitAuthor = getPrimaryAuthor();
    const [authorList, useLocalTemplate, template] = await Promise.all([
      getAllAuthors(),
      gitMobConfig.localTemplate(),
      gitConfig.getLocalCommitTemplate(),
    ]);
    const selectedCoAuthors = getSelectedCoAuthors(authorList);

    printMob(gitAuthor, selectedCoAuthors, useLocalTemplate, template);

    if (template && selectedCoAuthors) {
      await updateGitTemplate(selectedCoAuthors);
    }
  } else {
    await setMob(args);
  }
}

function printMob(gitAuthor, selectedCoAuthors, useLocalTemplate, template) {
  console.log(author(gitAuthor));

  if (selectedCoAuthors && selectedCoAuthors.length > 0) {
    console.log(selectedCoAuthors.join(os.EOL));
  }

  if (!useLocalTemplate && template) {
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
    console.error(red(`listCoAuthors error: ${error.message}`));
    process.exit(1);
  }
}

async function setMob(initials) {
  try {
    const authorList = await getAllAuthors();
    await saveMissingAuthors(initials, authorList);
    const selectedCoAuthors = await setCoAuthors(initials);

    const [useLocalTemplate, template] = await Promise.all([
      gitMobConfig.localTemplate(),
      gitConfig.getLocalCommitTemplate(),
    ]);

    const gitAuthor = getPrimaryAuthor();
    printMob(gitAuthor, selectedCoAuthors, useLocalTemplate, template);
  } catch (error) {
    console.error(red(`setMob error: ${error.message}`));
    if (error.message.includes('not found!')) {
      console.log(
        yellow(
          'Run "git config --global git-mob-config.github-fetch true" to fetch GitHub authors.'
        )
      );
    }

    process.exit(1);
  }
}

async function setAuthor(initial) {
  try {
    const authorList = await getAllAuthors();
    const author = authorList.find(author => author.key === initial);

    if (!author) {
      throw new Error(`${initial} author key not found!`);
    }

    setPrimaryAuthor(author);
  } catch (error) {
    console.error(red(`setAuthor error: ${error.message}`));
    process.exit(1);
  }
}

function author({ name, email }) {
  return oneLine`${name} <${email}>`;
}
