const fs = require('fs');
const path = require('path');
const os = require('os');

const { config, revParse } = require('../git-commands');

function fileExists(err) {
  return err.code !== 'ENOENT';
}

function append(messagePath, newAuthors) {
  return new Promise((resolve, reject) => {
    fs.readFile(messagePath, 'utf8', (err, data) => {
      if (err) {
        if (fileExists(err)) reject(err);
      }

      let result = newAuthors;
      if (data) {
        result = data.replace(/(\r\n|\r|\n){1,2}Co-authored-by.*/g, '') + newAuthors;
      }

      fs.writeFile(messagePath, result, err => {
        if (err) reject(err);

        resolve();
      });
    });
  });
}

function read(messagePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(messagePath, 'utf8', (err, data) => {
      if (err) {
        if (fileExists(err)) reject(err);
      }

      resolve(data);
    });
  });
}

function gitMessage(messagePath, appendFilePromise, readFilePromise) {
  const appendPromise = appendFilePromise || append;
  const readPromise = readFilePromise || read;

  return {
    writeCoAuthors: async coAuthorList => {
      const coAuthorText = coAuthorList
        .map(coAuthor => 'Co-authored-by: ' + coAuthor)
        .join(os.EOL);

      await appendPromise(messagePath, os.EOL + os.EOL + coAuthorText);
    },
    readCoAuthors: () => {
      return readPromise(messagePath);
    },
    removeCoAuthors: async () => {
      return appendPromise(messagePath, '');
    },
  };
}

function prepareCommitMsgTemplate() {
  const mobTemplate = path.join('.git', '.git-mob-template');
  if (fs.existsSync(mobTemplate)) return mobTemplate;
  return null;
}

function gitMessagePath() {
  return process.env.GITMOB_MESSAGE_PATH || revParse.gitPath('.gitmessage');
}

function commitTemplatePath() {
  return (
    process.env.GITMOB_MESSAGE_PATH ||
    config.get('commit.template') ||
    '.git/.gitmessage'
  );
}

module.exports = {
  gitMessage,
  gitMessagePath,
  commitTemplatePath,
  prepareCommitMsgTemplate,
};
