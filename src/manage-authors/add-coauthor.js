const { gitAuthors } = require('../git-authors');

async function addCoauthor(args) {
  const coauthors = gitAuthors();
  const authorList = await coauthors.read();
  if (Object.prototype.hasOwnProperty.call(authorList.coauthors, args[0])) {
    console.error(args[0] + ' already exists in .git-coauthors');
  } else {
    authorList.coauthors[args[0]] = { name: args[1], email: args[2] };
    await coauthors.overwrite(authorList);
    console.log(args[1] + ' has been added to the .git-coauthors file');
  }
}

module.exports = {
  addCoauthor,
};
