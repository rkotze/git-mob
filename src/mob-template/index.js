const fs = require('fs');

const { revParse } = require('../git-commands');

function installTempate() {
  return new Promise((resolve, reject) => {
    const pathToTemplate = revParse.gitPath('.git-mob-template');
    fs.open(pathToTemplate, 'w', err => {
      if (err) reject(err);
      resolve();
    });
  });
}

function uninstallTemplate() {
  return new Promise((resolve, reject) => {
    const pathToTemplate = revParse.gitPath('.git-mob-template');
    fs.unlink(pathToTemplate, err => {
      if (err) reject(err);
      resolve();
    });
  });
}

module.exports = {
  installTempate,
  uninstallTemplate,
};
