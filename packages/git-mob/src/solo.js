import minimist from 'minimist';
import { oneLine } from 'common-tags';
import { getPrimaryAuthor } from 'git-mob-core';

import { revParse, config } from '../src/git-commands';
import { gitMessage, gitMessagePath } from '../src/git-message';
import { checkForUpdates, runHelp, runVersion } from '../src/helpers';
import { resetMob } from '../src/git-mob-commands';

checkForUpdates();

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

if (!revParse.insideWorkTree()) {
  console.error('Error: not a git repository');
  process.exit(1);
}

runSolo();

async function runSolo() {
  try {
    await gitMessage(gitMessagePath()).removeCoAuthors();

    if (config.usingLocalTemplate() && config.usingGlobalTemplate()) {
      gitMessage(config.getGlobalTemplate()).removeCoAuthors();
    }

    resetMob();
    printAuthor();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function printAuthor() {
  console.log(author());
}

function author() {
  const { name, email } = getPrimaryAuthor();
  return oneLine`${name} <${email}>`;
}
