const { gitAuthors, gitCoauthorsPath } = require('../git-authors');

const SAMPLE_CONTENT = {
  coauthors: {
    hh: {
      name: 'Hulk Hogan',
      email: 'hulk_hogan22@hotmail.org',
    },
  },
};

createFileIfNotExist();

async function createFileIfNotExist() {
  const instance = gitAuthors();
  if (!instance.fileExists()) {
    try {
      await instance.write(SAMPLE_CONTENT);
      console.log('Add co-authors to:', gitCoauthorsPath);
    } catch (error) {
      console.log('Someting went wrong adding a new co-authors file, error:', error);
    }
  }
}
