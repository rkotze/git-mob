import minimist from 'minimist';
import {
  type Author,
  gitRevParse,
  repoAuthorList,
  saveNewCoAuthors,
} from 'git-mob-core';
import checkbox from '@inquirer/checkbox';
import { runSuggestCoauthorsHelp } from './helpers.js';
import { red, yellow } from './colours.js';

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
  },
});

async function execute(argv: minimist.ParsedArgs) {
  if (argv.help) {
    runSuggestCoauthorsHelp();
    process.exit(0);
  }

  const isGitRepo = await gitRevParse.insideWorkTree();
  if (!isGitRepo) {
    console.error(red('Error: not a git repository'));
    process.exit(1);
  }

  await coAuthorSuggestions(argv._.join(' '));
  process.exit(0);
}

async function coAuthorSuggestions(authorFilter: string) {
  try {
    const gitAuthors = await repoAuthorList(authorFilter.trim());

    if (gitAuthors && gitAuthors.length > 0) {
      const selected = await selectCoAuthors(gitAuthors);
      if (selected) {
        const saved = await saveNewCoAuthors(selected);
        if (saved) {
          console.log('Saved co-authors.');
        }
      }
    } else {
      console.log(yellow('Could not find authors!'));
    }
  } catch (error: unknown) {
    const errorSuggest = error as Error;
    console.error(red(`Error: ${errorSuggest.message}`));
    process.exit(1);
  }
}

async function selectCoAuthors(coAuthors: Author[]): Promise<Author[]> {
  const selected = await checkbox<Author>({
    message: 'Select co-authors to save',
    choices: coAuthors.map(author => ({
      name: `"${author.name}" ${author.email}`,
      value: author,
    })),
  });

  return selected;
}

await execute(argv);
