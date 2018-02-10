import test from 'ava';
import { exec } from 'shelljs';

test('-h prints help', async t => {
  const { stdout } = await exec('git mob -h', { silent: true });

  t.regex(stdout, /usage/i);
  t.regex(stdout, /options/i);
  t.regex(stdout, /examples/i);
});

test.skip('--help is intercepted by git launcher', async t => {
  const { code, stderr } = await exec('git mob --help', { silent: true });

  t.not(code, 0);
  t.regex(stderr, /no manual entry for git-mob/i);
});

test('-v prints version', async t => {
  const { stdout } = await exec('git mob -v', { silent: true });

  t.regex(stdout, /\d.\d.\d/);
});

test('--version prints version', async t => {
  const { stdout } = await exec('git mob --version', { silent: true });

  t.regex(stdout, /\d.\d.\d/);
});

test('does nothing when there is no mob', t => {
  const { stdout } = exec('git mob', { silent: true });

  t.is(stdout, '');
});

test.serial.todo('without args returns the current mob');

test('missing author when setting co-author mob rk', async t => {
  const { stdout } = await exec('git mob rk', { silent: true });

  t.regex(stdout, /error/i);
  t.regex(stdout, /rk initials not found/i);
  t.regex(stdout, /add to .\/\.git-authors file/i);
});
