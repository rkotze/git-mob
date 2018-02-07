#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

if (argv.h) {
  const help = `
Usage
  $ git mob <co-author-initials>

Options
  -h  Prints this help and exits

Examples
  $ git mob jd  # Set John Doe is co-author
  $ git mob jd am  # Set John and Amy as co-authors
  `;
  console.log(help);
}
