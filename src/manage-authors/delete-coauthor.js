const { gitAuthors } = require('../git-authors');

async function deleteCoauthor(key) {
  const coauthors = gitAuthors();
  const authorList = await coauthors.read();
  if (key in authorList.coauthors) {
    delete authorList.coauthors[key];
    await coauthors.overwrite(authorList);
    console.log(key + ': has been removed from .git-coauthors');
  } else {
    console.error(key + ': no such initials in .git-coauthors');
  }
}

module.exports = {
  deleteCoauthor,
};
