const fs = require('fs');
const os = require('os');
const { promisify } = require('util');

function append(messagePath, newAuthors) {
  return new Promise(function(resolve, reject) {
    fs.readFile(messagePath, 'utf8', function(err, data) {
      if (err) reject(err);

      const result =
        data.replace(/(\r\n|\r|\n){1,2}Co-authored-by.*/g, '') + newAuthors;

      fs.writeFile(messagePath, result, 'utf8', function(err) {
        if (err) reject(err);

        resolve();
      });
    });
  });
}

function gitMessage(messagePath, appendFilePromise) {
  const appendPromise = appendFilePromise || append;

  return {
    writeCoAuthors: async coAuthorList => {
      const coAuthorText = coAuthorList
        .map(coAuthor => 'Co-authored-by: ' + coAuthor)
        .join(os.EOL);

      await appendPromise(messagePath, os.EOL + os.EOL + coAuthorText);
    },
  };
}

module.exports = { gitMessage };
