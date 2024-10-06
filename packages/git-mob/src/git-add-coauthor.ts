import minimist from 'minimist';
import { Author, saveNewCoAuthors } from 'git-mob-core';
import { runAddCoauthorHelp, validateEmail } from './helpers.js';
import { red } from './colours.js';

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
  },
});

function buildAuthorFromInput(args: string[]): Author {
  if (args.length !== 3) {
    throw new Error('Incorrect number of parameters.');
  }

  if (!validateEmail(args[2])) {
    throw new Error('Invalid email format.');
  }

  return new Author(args[0], args[1], args[2]);
}

async function execute(argv: minimist.ParsedArgs): Promise<void> {
  if (argv.help) {
    runAddCoauthorHelp();
    return;
  }

  const author = buildAuthorFromInput(argv._);
  await saveNewCoAuthors([author]);
  console.log(author.name + ' has been added to the .git-coauthors file');
}

await execute(argv)
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(red((error as Error).message));
    process.exit(1);
  });
