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
      --uninstallTemplate  Removes the mob template file for prepare-commit-msg

    Examples
      $ git mob jd     # Set John Doe as co-author
      $ git mob jd am  # Set John & Amy as co-authors
      $ git mob -l     # Show a list of all co-authors
      $ git solo       # Dissipate the mob
      $ git mob-print  # Prints git-mob template to stdout. Used for prepare-commit-msg hook.
  `;
  console.log(message);
}

function runAddCoauthorHelp() {
  const message = stripIndent`
    Usage
      $ git add-author <co-author-initials> "Coauthor Name" <coauthor-email-address>
    Options
      -h  Prints usage information
    Examples
      $ git add-author jd "John Doe" johndoe@aol.org  # adds John Doe to coauthors file
      $ git mob jd                                    # Set John as co-authors
      $ git mob -l                                    # Show a list of all co-authors, John Doe should be there
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

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports = {
  runHelp,
  runVersion,
  checkForUpdates,
  printList,
  validateEmail,
  runAddCoauthorHelp,
};
