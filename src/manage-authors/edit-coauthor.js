const { gitAuthors } = require('../git-authors');

async function editCoauthor({ _, ...props }) {
  if ('name' in props || 'email' in props) {
    const [key] = _;
    const coauthors = gitAuthors();
    const authorList = await coauthors.read();
    if (key in authorList.coauthors) {
      if (props.name) {
        authorList.coauthors[key].name = props.name;
      }

      if (props.email) {
        authorList.coauthors[key].email = props.email;
      }

      await coauthors.overwrite(authorList);
      console.log(key + ' has been updated.');
    } else {
      console.error(key + ' does not exist in your .git-coauthors file.');
    }
  } else {
    console.error(
      'Please provide a name or an email property. Use -h for examples.'
    );
  }
}

module.exports = {
  editCoauthor,
};
