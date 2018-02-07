#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var shell = require('shelljs');

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
