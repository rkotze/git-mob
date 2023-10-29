import path from 'path';

const testHelperPath = path.join(process.cwd(), '/test-helpers');

export {
  GITMOB_COAUTHORS_PATH: path.join(testHelperPath, '.git-coauthors'),
  GITMOB_MESSAGE_PATH: path.join(testHelperPath, '.gitmessage'),
  GITMOB_GLOBAL_MESSAGE_PATH: path.join(testHelperPath, '.gitglobalmessage'),
  NO_UPDATE_NOTIFIER: true,
  HOME: testHelperPath,
  GITMOB_TEST_ENV_FOLDER: './test-env',
  GITMOB_TEST_HELPER_FOLDER: './test-helpers',
};
