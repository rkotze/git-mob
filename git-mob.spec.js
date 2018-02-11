import test from 'ava';
import { exec } from 'shelljs';

test.after.always('cleanup', () => {
  exec('git config --remove-section git-mob');
});

test('-h prints help', async t => {
  const { stdout } = await exec('git mob -h', { silent: true });

  t.regex(stdout, /usage/i);
  t.regex(stdout, /options/i);
  t.regex(stdout, /examples/i);
});

if (process.platform === 'win32') {
  // Windows tries to open a man page at git-doc/git-mob.html which errors.
  test.skip('--help is intercepted by git launcher on Windows', () => {});
} else {
  test('--help is intercepted by git launcher', async t => {
    const { code, stderr } = await exec('git mob --help', { silent: true });

    t.not(code, 0);
    t.regex(stderr, /no manual entry for git-mob/i);
  });
}

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

test('returns the current mob', t => {
  const dideler = 'Dennis Ideler <dideler@findmypast.com>';
  const rkotze = 'Richard Kotze <rkotze@findmypast.com>';
  const coauthors = [dideler, rkotze];

  coauthors.forEach(coauthor => addCoAuthor(coauthor));

  const { stdout } = exec('git mob', { silent: true });

  t.is(stdout, dideler + '\n' + rkotze + '\n');

  coauthors.forEach(coauthor => removeCoAuthor(coauthor));
});

test.serial.todo('overwrites old mob when setting a new mob');

test('missing author when setting co-author mob rk', async t => {
  const { stdout } = await exec('git mob rk', { silent: true });

  t.regex(stdout, /error/i);
  t.regex(stdout, /rk initials not found/i);
  t.regex(stdout, /add to .\/\.git-authors file/i);
});

function addCoAuthor(coauthor) {
  exec(`git config --add git-mob.co-author "${coauthor}"`);
}

function removeCoAuthor(coauthor) {
  exec(`git config --unset git-mob.co-author "^${coauthor}"`);
}
