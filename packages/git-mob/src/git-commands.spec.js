import test from 'ava';
import { version } from './git-commands.js';

test('extract git versions return in expected format [major, minor]', t => {
  let [major, minor] = version('git version 2.10.1.windows.1');
  t.is(major + '.' + minor, '2.10');

  [major, minor] = version('git version 2.15.0');
  t.is(major + '.' + minor, '2.15');

  [major, minor] = version('git version 2.1.2 (Apple Git-101.1)\nhub version 2.2.9');
  t.is(major + '.' + minor, '2.1');
});
