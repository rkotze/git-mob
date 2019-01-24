const { gitAuthors } = require('../git-authors');

async function editCoauthor([key, ...args]) {
  const coauthors = gitAuthors();
  const authorList = await coauthors.read();
  if (key in authorList.coauthors) {
    args
      .filter(arg => arg.includes('='))
      .forEach(arg => {
        const [property, value] = arg.split('=');
        if (property in authorList.coauthors[key]) {
          authorList.coauthors[key][property] = value;
        } else {
          console.log(
            property +
              ' is not a property of a coauthor. Only update name and email.'
          );
        }
      });
    await coauthors.overwrite(authorList);
    console.log(key + ' has been updated.');
  } else {
    console.log(key + ' does not exist in your .git-coauthors file.');
  }
}

module.exports = {
  editCoauthor,
};
