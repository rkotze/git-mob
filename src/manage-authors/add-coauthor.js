const { gitAuthors } = require('../git-authors');

async function addCoauthor([key, name, email]) {
  const coauthors = gitAuthors();
  const authorList = await coauthors.read();
  if (key in authorList.coauthors) {
    console.error(key + ' already exists in .git-coauthors');
  } else {
    authorList.coauthors[key] = { name, email };
    await coauthors.overwrite(authorList);
    console.log(name + ' has been added to the .git-coauthors file');
  }
}

module.exports = {
  addCoauthor,
};
