import { EOL } from 'node:os';
import { stripIndent } from 'common-tags';
import { type Author } from 'git-mob-core';
import updateNotifier from 'update-notifier';
import pkg from '../package.json';

const weekly = 1000 * 60 * 60 * 24 * 7;

function runHelp() {
  const message = stripIndent`
    Usage
      $ git mob <co-author-initials> <GitHub username>
      $ git solo
      $ git mob-print
      $ git add-coauthor <co-author-initials> "Coauthor Name" <coauthor-email-address>
      $ git suggest-coauthors [author name | author email]

    Options
      -h  Prints usage information
      -v  Prints current version
      -l  Prints list of available co-authors
      -o  Overwrite the main author
      -p  Print path to .git-coauthors file

    Examples
      $ git mob jd     # Set John Doe as co-author
      $ git mob jd am  # Set John & Amy as co-authors
      $ git mob rkotze # Set co-author from GitHub username
      $ git mob -l     # Show a list of all co-authors
      $ git mob -o jd  # Will change main author to jd
      $ git solo       # Dissipate the mob
      $ git mob-print  # Prints git-mob template to stdout. Used for prepare-commit-msg hook.
  `;
  console.log(message);
}

function runAddCoauthorHelp() {
  const message = stripIndent`
    Usage
      $ git add-coauthor <co-author-initials> "Coauthor Name" <coauthor-email-address>
    Options
      -h  Prints usage information
    Examples
      $ git add-coauthor jd "John Doe" johndoe@aol.org  # adds John Doe to coauthors file
  `;
  console.log(message);
}

function runMobPrintHelp() {
  const message = stripIndent`
    Usage
      $ git mob-print
    Options
      -h  Prints usage information
      -i  Prints a comma separated list of selected co-author initials
    Examples  
      $ git mob -i  # Prints a list of selected co-authors initials (jd,bd)
  `;
  console.log(message);
}

function runSuggestCoauthorsHelp() {
  const message = stripIndent`
    Usage
      $ git suggest-coauthors [author name | author email]
    Options
      -h  Prints usage information
    Example
      $ git suggest-coauthors  # suggests coauthors who have contributed to this repo
      $ git suggest-coauthors rich  # filter suggested coauthors
  `;
  console.log(message);
}

function runVersion() {
  console.log(pkg.version);
}

function checkForUpdates(intervalInMs = weekly) {
  updateNotifier({ pkg, updateCheckInterval: intervalInMs }).notify({
    isGlobal: true,
  });
}

function printList(list: Author[]) {
  console.log(list.map(a => `${a.key}, ${a.name}, ${a.email}`).join(EOL));
}

function validateEmail(email: string) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|((\w+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export {
  runHelp,
  runVersion,
  checkForUpdates,
  printList,
  validateEmail,
  runAddCoauthorHelp,
  runMobPrintHelp,
  runSuggestCoauthorsHelp,
};
