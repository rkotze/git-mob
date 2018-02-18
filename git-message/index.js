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
      const coAuthorText = coAuthorList
        .map(coAuthor => {
          return 'Co-authored-by: ' + coAuthor;
        })
        .join(os.EOL);

      await append(MESSAGE_PATH, os.EOL + os.EOL + coAuthorText);
      return MESSAGE_PATH;
    },
  };
}

module.exports = { gitMessage };
