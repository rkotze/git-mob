const { gitAuthors } = require('../git-authors');

async function editCoauthor(args) {
  const coauthors = gitAuthors();
  const authorList = await coauthors.read();
  args
    .filter(arg => arg.includes('='))
    .forEach(arg => {
      const [key, value] = arg.split('=');
      authorList.coauthors[args[0]][key] = value;
    });
  await coauthors.overwrite(authorList);
}

module.exports = {
  editCoauthor,
};
