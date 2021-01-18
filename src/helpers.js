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
      $ git add-coauthor <co-author-initials> "Coauthor Name" <coauthor-email-address>
      $ git delete-coauthor <co-author-initials>
      $ git edit-coauthor <co-author-initials> --name="Coauthor Name" --email="coauthor-email-address"
      $ git suggest-coauthors

    Options
      -h  Prints usage information
      -v  Prints current version
      -l  Prints list of available co-authors
      -o  Overwrite the main author

    Examples
      $ git mob jd     # Set John Doe as co-author
      $ git mob jd am  # Set John & Amy as co-authors
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
      $ git mob jd                                      # Set John as co-authors
      $ git mob -l                                      # Show a list of all co-authors, John Doe should be there
  `;
  console.log(message);
}

function runDeleteCoauthorHelp() {
  const message = stripIndent`
    Usage
      $ git delete-coauthor <co-author-initials>
    Options
      -h  Prints usage information
    Examples
      $ git delete-coauthor jd  # deletes John Doe to coauthors file

  `;
  console.log(message);
}

function runEditCoauthorHelp() {
  const message = stripIndent`
    Usage
      $ git edit-coauthor <co-author-initials> name="Coauthor Name" email="Coauthor Email"
    Options
      -h  Prints usage information
    Examples
      $ git edit-coauthor jd --name="Jeb Diamond" --email="jeb@Diamond.com"    # Updates email and name
      $ git edit-coauthor jd --name="Jeb Diamond"                           # Updates just the name
      $ git edit-coauthor jd --email="jeb@diamond.com"                      # Updates just the email

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
      $ git suggest-coauthors
    Options
      -h  Prints usage information
    Example
      $ git suggest-coauthors  # suggests coauthors to add based on existing committers to the repo
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
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|((\w+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports = {
  runHelp,
  runVersion,
  checkForUpdates,
  printList,
  validateEmail,
  runAddCoauthorHelp,
  runDeleteCoauthorHelp,
  runEditCoauthorHelp,
  runMobPrintHelp,
  runSuggestCoauthorsHelp,
};
