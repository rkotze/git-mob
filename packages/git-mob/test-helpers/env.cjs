const { spawnSync } = require('child_process');
const path = require('path');

const testHelperPath = path.join(process.cwd(), '/test-helpers');
// module.exports = {
//   GITMOB_COAUTHORS_PATH: path.join(testHelperPath, '.git-coauthors'),
//   GITMOB_MESSAGE_PATH: path.join(testHelperPath, '.gitmessage'),
//   GITMOB_GLOBAL_MESSAGE_PATH: path.join(testHelperPath, '.gitglobalmessage'),
//   NO_UPDATE_NOTIFIER: true,
//   HOME: testHelperPath,
//   GITMOB_TEST_ENV_FOLDER: './test-env',
//   GITMOB_TEST_HELPER_FOLDER: './test-helpers',
// };

process.env.GITMOB_COAUTHORS_PATH = path.join(testHelperPath, '.git-coauthors');
process.env.GITMOB_MESSAGE_PATH = path.join(testHelperPath, '.gitmessage');
process.env.GITMOB_GLOBAL_MESSAGE_PATH = path.join(
  testHelperPath,
  '.gitglobalmessage'
);
process.env.NO_UPDATE_NOTIFIER = true;
process.env.HOME = testHelperPath;
process.env.GITMOB_TEST_ENV_FOLDER = './test-env';
process.env.GITMOB_TEST_HELPER_FOLDER = './test-helpers';
