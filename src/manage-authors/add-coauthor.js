const { gitAuthors } = require('../git-authors');

async function addCoauthor(args) {
  const instance = gitAuthors();
  const authorList = await instance.read();
  authorList.coauthors[args[0]] = { name: args[1], email: args[2] };
  await instance.overwrite(authorList);
  console.log(args[1] + ' has been added to the .git-coauthors file');
}

module.exports = {
  addCoauthor,
};
