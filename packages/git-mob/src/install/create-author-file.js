import { pathToCoAuthors } from 'git-mob-core';
import { gitAuthors } from '../git-authors/index.js';

const SAMPLE_CONTENT = {
  coauthors: {
    hh: {
      name: 'Hulk Hogan',
      email: 'hulk_hogan22@hotmail.org',
    },
  },
};

await createFileIfNotExist();

async function createFileIfNotExist() {
  const instance = gitAuthors();
  const authorFileExists = await instance.fileExists();
  if (authorFileExists) {
    console.log(`${await pathToCoAuthors()} file already exists`);
  } else {
    try {
      await instance.write(SAMPLE_CONTENT);
      console.log('Add co-authors to:', await pathToCoAuthors());
    } catch (error) {
      console.log(
        'Something went wrong adding a new co-authors file, error:',
        error
      );
    }
  }
}
