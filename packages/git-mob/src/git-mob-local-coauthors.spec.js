import { EOL } from 'node:os';
import test, { before, after } from 'ava';

import {
  exec,
  setCoauthorsFile,
  deleteCoauthorsFile,
  setup,
  tearDown,
  setLocalCoauthorsFile,
  deleteLocalCoauthorsFile,
} from '../test-helpers';

before('setup', () => {
  setup();
  setCoauthorsFile();
});

after.always('final cleanup', () => {
  deleteCoauthorsFile();
  tearDown();
});

test('--list print a list of available co-authors from repo root .git-coauthor', t => {
  setLocalCoauthorsFile();
  const oldEnv = process.env.GITMOB_COAUTHORS_PATH;
  delete process.env.GITMOB_COAUTHORS_PATH;
  const actual = exec('git mob --list').stdout.trimEnd();
  const expected = [
    'dd, Din Djarin, din@mando.com',
    'bk, Bo-Katan Kryze, bo-katan@dwatch.com',
  ].join(EOL);

  t.is(actual, expected);
  process.env.GITMOB_COAUTHORS_PATH = oldEnv;
  deleteLocalCoauthorsFile();
});
