const os = require('os');
const { stripIndent } = require('common-tags');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const weekly = 1000 * 60 * 60 * 24 * 7;

function runHelp() {
  const message = stripIndent`
    Usage
      $ git mob <co-author-initials>
      $ git solo
      $ git mob-print

    Options
      -h  Prints usage information
      -v  Prints current version
      -l  Prints list of available co-authors

      --installTemplate  Installs a template file for prepare-commit-msg

    Examples
      $ git mob jd     # Set John Doe as co-author
      $ git mob jd am  # Set John & Amy as co-authors
      $ git mob -l     # Show a list of all co-authors
      $ git solo       # Dissipate the mob
      $ git mob-print  # Prints git-mob template to stdout. Used for prepare-commit-msg hook.
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

function printList(list) {
  console.log(list.join(os.EOL));
}

module.exports = { runHelp, runVersion, checkForUpdates, printList };
