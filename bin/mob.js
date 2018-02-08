#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const shell = require('shelljs');

if (argv.h) {
  console.log(`
Usage
  $ git mob <co-author-initials>
  $ git solo

Options
  -h  Prints this help and exits

Examples
  $ git mob jd  # Set John Doe is co-author
  $ git mob jd am  # Set John and Amy as co-authors
  $ git solo  # Go back to soloing
  `);
  shell.exit(0);
}

if (argv._.length > 0) {
  console.log(`
    Error:
    - Author ${argv._[0]} initials not found.
    - Please add to .gitauthor file.
  `);
  shell.exit(1);
}
