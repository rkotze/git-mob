#! /usr/bin/env node
const { gitMessage, prepareCommitMsgTemplate } = require('../src/git-message');

async function printCoAuthors() {
  try {
    const coAuthors = await gitMessage(prepareCommitMsgTemplate()).readCoAuthors();
    console.log(coAuthors);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

printCoAuthors();
