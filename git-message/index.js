const fs = require('fs');
const path = require('path');
const os = require('os');
const { promisify } = require('util');

const MESSAGE_PATH = path.join('.git', '.git-message');

function gitMessage(appendFilePromise) {
  const appendPromise = appendFilePromise || promisify(fs.appendFile);
  async function append(path, content) {
    try {
      return await appendPromise(path, content, 'utf8');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return {
    writeCoAuthors: async coAuthorList => {
      const coAuthorText = coAuthorList.reduce((acc, coAuthor, i, arr) => {
        const newline = i < arr.length - 1 ? os.EOL : '';
        return acc + 'Co-authored-by: ' + coAuthor + newline;
      }, '');
      await append(MESSAGE_PATH, coAuthorText);
      return MESSAGE_PATH;
    },
  };
}

module.exports = { gitMessage };
