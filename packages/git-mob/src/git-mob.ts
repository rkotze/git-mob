import os from 'node:os';
import minimist from 'minimist';
import { stripIndents } from 'common-tags';
import {
  getAllAuthors,
  getPrimaryAuthor,
  getSelectedCoAuthors,
  gitMobConfig,
  gitConfig,
  gitRevParse,
  setPrimaryAuthor,
  updateGitTemplate,
  Author,
  pathToCoAuthors,
  setSelectedAuthors,
  AuthorTrailers,
} from 'git-mob-core';
import { checkForUpdates, runHelp, runVersion, printList } from './helpers.js';
import { configWarning } from './check-author.js';
import { red, yellow } from './colours.js';
import { saveMissingAuthors } from './git-authors/save-missing-authors.js';

checkForUpdates();

const argv = minimist(process.argv.slice(2), {
  boolean: ['h', 'v', 'l', 'o', 'p'],
  string: ['sb', 'rb'],

  alias: {
    h: 'help',
    v: 'version',
    l: 'list',
    o: 'override',
    p: 'coauthors-path',
  },
});

await execute(argv).catch(() => null);

async function execute(args: minimist.ParsedArgs) {
  if (args.help) {
    runHelp();
    process.exit(0);
  }

  if (args.version) {
    runVersion();
    process.exit(0);
  }

  if (args['coauthors-path']) {
    console.log(await pathToCoAuthors());
    process.exit(0);
  }

  if (args.list) {
    await listCoAuthors();
    process.exit(0);
  }

  const isGitRepo = await gitRevParse.insideWorkTree();
  if (!isGitRepo) {
    console.error(red('Error: not a Git repository'));
    process.exit(1);
  }

  if (args.override) {
    const initial = args._.shift();
    if (initial) {
      await setAuthor(initial);
    }

    await runMob(mapTrailersToInitials(args));
  } else {
    await runMob(mapTrailersToInitials(args));
  }
}

function normaliseToArray<T>(input: T | T[]): T[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (input === undefined || input === null || input === '') {
    return [];
  }

  return [input];
}

function mapTrailersToInitials(
  args: minimist.ParsedArgs
): Array<[string, AuthorTrailers]> {
  const sb = normaliseToArray(args.sb as string[]);
  const rb = normaliseToArray(args.rb as string[]);

  const remainingArgs = { cb: args._ || [], sb, rb };
  const mapTrailers: Record<string, AuthorTrailers> = {
    cb: AuthorTrailers.CoAuthorBy,
    sb: AuthorTrailers.SignedOffBy,
    rb: AuthorTrailers.ReviewedBy,
  };

  const result: Array<[string, AuthorTrailers]> = [];
  for (const [accept, value] of Object.entries(remainingArgs)) {
    if (Array.isArray(value) && value.length > 0) {
      for (const author of value) {
        if (typeof author === 'string') {
          result.push([author, mapTrailers[accept]]);
        }
      }
    }
  }

  return result;
}

async function runMob(args: Array<[string, AuthorTrailers]>) {
  if (args.length === 0) {
    const gitAuthor = await getPrimaryAuthor();
    const [authorList, useLocalTemplate, template] = await Promise.all([
      getAllAuthors(),
      gitMobConfig.localTemplate(),
      gitConfig.getLocalCommitTemplate(),
    ]);
    const selectedCoAuthors = await getSelectedCoAuthors(authorList);

    printMob(gitAuthor, selectedCoAuthors, useLocalTemplate, template);

    if (template && selectedCoAuthors) {
      await updateGitTemplate(selectedCoAuthors);
    }
  } else {
    await setMob(args);
  }
}

function printMob(
  gitAuthor: Author | undefined,
  selectedCoAuthors: Author[],
  useLocalTemplate: boolean,
  template: string | undefined
) {
  const theAuthor = gitAuthor || new Author('', '', '');
  const authorWarnConfig = configWarning(theAuthor);
  if (authorWarnConfig) {
    console.log(red(authorWarnConfig));
    process.exit(1);
  }

  console.log(theAuthor.toString());

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
}

async function listCoAuthors() {
  try {
    const coAuthors = await getAllAuthors();

    printList(coAuthors);
  } catch (error: unknown) {
    const authorListError = error as Error;
    console.error(red(`listCoAuthors error: ${authorListError.message}`));
    process.exit(1);
  }
}

async function setMob(initials: Array<[string, AuthorTrailers]>) {
  try {
    const authorList = await getAllAuthors();
    await saveMissingAuthors(
      initials.map(([key]) => key),
      authorList
    );
    const selectedCoAuthors = await setSelectedAuthors(initials);

    const [useLocalTemplate, template] = await Promise.all([
      gitMobConfig.localTemplate(),
      gitConfig.getLocalCommitTemplate(),
    ]);

    const gitAuthor = await getPrimaryAuthor();
    printMob(gitAuthor, selectedCoAuthors, useLocalTemplate, template);
  } catch (error: unknown) {
    const setMobError = error as Error;
    console.error(red(`setMob error: ${setMobError.message}`));
    if (setMobError.message.includes('not found!')) {
      console.log(
        yellow(
          'Run "git config --global git-mob-config.github-fetch true" to fetch GitHub authors.'
        )
      );
    }

    process.exit(1);
  }
}

async function setAuthor(initial: string) {
  try {
    const authorList = await getAllAuthors();
    const author = authorList.find(author => author.key === initial);

    if (!author) {
      throw new Error(`${initial} author key not found!`);
    }

    await setPrimaryAuthor(author);
  } catch (error: unknown) {
    const setAuthorError = error as Error;
    console.error(red(`setAuthor error: ${setAuthorError.message}`));
    process.exit(1);
  }
}
