#! /usr/bin/env node
const os = require('os');
const minimist = require('minimist');
const { runSuggestCoauthorsHelp } = require('../src/helpers');
const { authors, revParse } = require('../src/git-commands');

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
  },
});

async function execute(argv) {
  if (argv.help) {
    runSuggestCoauthorsHelp();
    process.exit(0);
  }

  if (!revParse.insideWorkTree()) {
    console.error('Error: not a git repository');
    process.exit(1);
  }

  await printCoauthorSuggestions();
  process.exit(0);
}

async function printCoauthorSuggestions() {
  try {
    const shortLogAuthorSummary = authors.shortLogAuthorSummary();
    const gitAuthors = shortLogAuthorSummary
      .split('\n')
      .filter(summary => summary !== '')
      .map(summary => convertSummaryToCoauthor(summary));

    if (gitAuthors.length > 0) {
      console.log(os.EOL +
        'Here are some suggestions for coauthors based on existing authors of this repository' +
        os.EOL);

      console.log(suggestedCoauthorAddCommands(gitAuthors));

      console.log(os.EOL +
        'Paste any line above into your console to add them as an author' +
        os.EOL);
    } else {
      console.log('Unable to find existing authors');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function convertSummaryToCoauthor(summaryLine) {
  const name = nameFromSummaryLine(summaryLine);
  return {
    name,
    email: emailFromSummaryLine(summaryLine),
    initials: initialsFromName(name)
  };
}

function suggestedCoauthorAddCommands(coauthors) {
  return coauthors
    .sort()
    .map(coauthor => ['git add-coauthor', coauthor.initials, JSON.stringify(coauthor.name), coauthor.email].join(' '))
    .join(os.EOL);
}

function initialsFromName(name) {
  return name.split(' ').map(word => word[0].toLowerCase()).join('');
}

function nameFromSummaryLine(summaryLine) {
  return summaryLine.split('\t')[1].split(' ').slice(0, -1).join(' ');
}

function emailFromSummaryLine(summaryLine) {
  return summaryLine.split('\t')[1].split(' ').pop().slice(1, -1);
}

execute(argv);

