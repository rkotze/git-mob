const fs = require('fs');
const os = require('os');
const { promisify } = require('util');

function gitMessage(messagePath, appendFilePromise) {
  const appendPromise = appendFilePromise || promisify(fs.appendFile);
  async function append(content) {
    try {
      return await appendPromise(messagePath, content, 'utf8');
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

      await append(os.EOL + os.EOL + coAuthorText);
      return 'SAVED';
    },
  };
}

module.exports = { gitMessage };
