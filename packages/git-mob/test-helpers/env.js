const path = require('path');

const testHelperPath = path.join(process.cwd(), '/test-helpers');
module.exports = {
  GITMOB_COAUTHORS_PATH: path.join(testHelperPath, '.git-coauthors'),
  GITMOB_MESSAGE_PATH: path.join(testHelperPath, '.gitmessage'),
  NO_UPDATE_NOTIFIER: true,
  HOME: testHelperPath
};
