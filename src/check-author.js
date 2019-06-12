const os = require('os');

function configWarning({ name, email }) {
  let result;
  if (name === '' || email === '') {
    result = 'Warning: Missing information for the primary author. Set with:';
  }

  if (name === '') {
    result += os.EOL + '$ git config --global user.name "Jane Doe"';
  }

  if (email === '') {
    result += os.EOL + '$ git config --global user.email "jane@example.com"';
  }

  return result;
}

module.exports = {
  configWarning,
};
