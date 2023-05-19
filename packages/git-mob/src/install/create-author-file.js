import { gitAuthors } from '../git-authors';
import { pathToCoAuthors } from 'git-mob-core';

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
  if (instance.fileExists()) {
    console.log(`${pathToCoAuthors()} file already exists`);
  } else {
    try {
      await instance.write(SAMPLE_CONTENT);
      console.log('Add co-authors to:', pathToCoAuthors());
    } catch (error) {
      console.log(
        'Something went wrong adding a new co-authors file, error:',
        error
      );
    }
  }
}
