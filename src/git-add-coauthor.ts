/* eslint @typescript-eslint/object-curly-spacing: ["error", "always"] */
import minimist from 'minimist';
import { runAddCoauthorHelp, validateEmail } from './helpers';
import { addCoauthor } from './manage-authors/add-coauthor';

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

  await addCoauthor(buildInputs(argv._));
}

execute(argv)
  .then(() => {
    process.exit(0);
  })
  .catch((error: Error) => {
    console.error(error.message);
    process.exit(1);
  });
