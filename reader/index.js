const fs = require('fs');
const os = require('os');
const path = require('path');
const { promisify } = require('util');

function readSetup(readFilePromise) {
  const readPromise = readFilePromise || promisify(fs.readFile);
  async function readFile(path) {
    try {
      return await readPromise(path, 'utf8');
    } catch (ex) {
      throw new Error(ex.message);
    }
  }

  return {
    gitAuthor: async () => await readFile(path.join(os.homedir(), '.gitauthor'))
  };
}

module.exports = { readSetup };
