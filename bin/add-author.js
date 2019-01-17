#! /usr/bin/env node
const minimist = require('minimist');
const { gitAuthors } = require('../src/git-authors');

const argv = minimist(process.argv.slice(2), {});

async function addCoauthor(argv) {
  const instance = gitAuthors();
  const authorList = await instance.read();
  const args = argv._;
  authorList.coauthors[args[0]] = { name: args[1], email: args[2] };
  instance.overwrite(authorList);
  console.log(args[1] + ' has been added to the .git-coauthors file');
}

addCoauthor(argv);
