const test = require('ava');
const git = require('./git-commands');

test('extract git versions return in expected format [major, minor]', t => {
  let [major, minor] = git.version('git version 2.10.1.windows.1');
  t.is(major + '.' + minor, '2.10');

  [major, minor] = git.version('git version 2.15.0');
  t.is(major + '.' + minor, '2.15');

  [major, minor] = git.version(
    'git version 2.1.2 (Apple Git-101.1)\nhub version 2.2.9'
  );
  t.is(major + '.' + minor, '2.1');
});
