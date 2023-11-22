import { createCoAuthorsFile } from 'git-mob-core';

await createFileIfNotExist();

async function createFileIfNotExist() {
  try {
    if (await createCoAuthorsFile()) {
      console.log('Co-authors file created!');
    }
  } catch (error) {
    console.log('Something went wrong adding a new co-authors file, error:', error);
  }
}
