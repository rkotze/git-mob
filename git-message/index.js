const fs = require('fs');
const os = require('os');

function append(messagePath, newAuthors) {
  return new Promise((resolve, reject) => {
    fs.readFile(messagePath, 'utf8', (err, data) => {
      if (err) reject(err);

      let result = newAuthors;
      if (data) {
        result =
          data.replace(/(\r\n|\r|\n){1,2}Co-authored-by.*/g, '') + newAuthors;
      }

      fs.writeFile(messagePath, result, err => {
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
    removeCoAuthors: async () => {
      return await appendPromise(messagePath, '');
    },
  };
}

module.exports = { gitMessage };
