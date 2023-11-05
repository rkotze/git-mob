import minimist from 'minimist';
import { runAddCoauthorHelp, validateEmail } from './helpers.js';
import { addCoauthor } from './manage-authors/add-coauthor.js';
import { red } from './colours.js';

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
  },
});

function buildInputs(args: string[]): [string, string, string] {
  if (args.length !== 3) {
    throw new Error('Incorrect number of parameters.');
  }

  if (!validateEmail(args[2])) {
    throw new Error('Invalid email format.');
  }

  return [args[0], args[1], args[2]];
}

async function execute(argv: minimist.ParsedArgs): Promise<void> {
  if (argv.help) {
    runAddCoauthorHelp();
    return;
  }

  const coauthorDetails = buildInputs(argv._);
  await addCoauthor(coauthorDetails);
  const [, name] = coauthorDetails;
  console.log(name + ' has been added to the .git-coauthors file');
}

await execute(argv)
  .then(() => {
    process.exit(0);
  })
  .catch((error: Error) => {
    console.error(red(error.message));
    process.exit(1);
  });
