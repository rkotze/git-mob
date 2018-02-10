const fs = require('fs');
const os = require('os');
const path = require('path');
const { promisify } = require('util');
const yaml = require('js-yaml');

function gitAuthors(readFilePromise) {
  const readPromise = readFilePromise || promisify(fs.readFile);
  async function readFile(path) {
    try {
      return await readPromise(path, 'utf8');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  return {
    read: async () => {
      const authorYaml = await readFile(
        path.join(os.homedir(), '.git-authors')
      );
      return yaml.load(authorYaml);
    },

    coAuthors(authorInitials, authorJson) {
      const authors = authorJson.authors;
      const emailDomain = authorJson.email.domain;
      return authorInitials.map(initials => {
        const author = authors[initials].split('; ');
        const formatName =
          author[1] || author[0].replace(' ', '-').toLowerCase();
        return `Co-authored-by: ${author[0]} <${formatName}@${emailDomain}>`;
      });
    },
  };
}

module.exports = { gitAuthors };
