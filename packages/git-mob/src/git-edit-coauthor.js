import minimist from 'minimist';
import { runEditCoauthorHelp } from '../src/helpers';
import { editCoauthor } from '../src/manage-authors/edit-coauthor';

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
  },
});

async function execute(argv) {
  if (argv.help) {
    runEditCoauthorHelp();
    process.exit(0);
  }

  await editCoauthor(argv);
  process.exit(0);
}

execute(argv);
