import minimist from 'minimist';
import { gitRevParse, getPrimaryAuthor, solo } from 'git-mob-core';
import { checkForUpdates, runHelp, runVersion } from './helpers.js';

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

const isGitRepo = await gitRevParse.insideWorkTree();
if (!isGitRepo) {
  console.error('Error: not a git repository');
  process.exit(1);
}

await runSolo();

async function runSolo() {
  try {
    await solo();
    await printAuthor();
  } catch (error: unknown) {
    const soloError = error as Error;
    console.error(`Error: ${soloError.message}`);
    process.exit(1);
  }
}

async function printAuthor() {
  const author = await getPrimaryAuthor();
  console.log(author?.toString());
}
