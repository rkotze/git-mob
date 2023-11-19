import os from 'node:os';
import minimist from 'minimist';
import { type Author, gitRevParse, repoAuthorList } from 'git-mob-core';
import { runSuggestCoauthorsHelp } from './helpers.js';

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
    console.error('Error: not a git repository');
    process.exit(1);
  }

  await printCoauthorSuggestions(argv._.join(' '));
  process.exit(0);
}

async function printCoauthorSuggestions(authorFilter: string) {
  try {
    const gitAuthors = await repoAuthorList(authorFilter.trim());

    if (gitAuthors && gitAuthors.length > 0) {
      console.log(
        os.EOL +
          'Here are some suggestions for coauthors from contributors to this repository' +
          os.EOL
      );

      console.log(suggestedCoauthorAddCommands(gitAuthors));

      console.log(
        os.EOL +
          'Paste any line above into your console to add them as an author' +
          os.EOL
      );
    } else {
      console.log('Unable to find existing authors');
    }
  } catch (error: unknown) {
    const errorSuggest = error as Error;
    console.error(`Error: ${errorSuggest.message}`);
    process.exit(1);
  }
}

function suggestedCoauthorAddCommands(coauthors: Author[]): string {
  return coauthors
    .map(coauthor =>
      ['git add-coauthor', coauthor.key, `"${coauthor.name}"`, coauthor.email].join(
        ' '
      )
    )
    .join(os.EOL);
}

await execute(argv);
