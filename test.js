import test from 'ava';
import { exec } from 'shelljs';

test('mob help', async t => {
  const { stdout } = await exec('git mob -h', { silent: true });

  t.regex(stdout, /usage/i);
  t.regex(stdout, /options/i);
  t.regex(stdout, /examples/i);
});
