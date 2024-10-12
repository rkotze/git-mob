import { EOL } from 'node:os';
import test from 'ava';
import { exec } from '../test-helpers/index.js';

test('Suggests coauthors using repo contributors', t => {
  const { stdout } = exec('git suggest-coauthors');

  t.regex(stdout, /"Richard Kotze" richkotze@outlook.com/);
});

test('Filter suggestions of coauthors', t => {
  const { stdout } = exec('git suggest-coauthors dennis i');

  t.regex(stdout, /git add-coauthor diid "Dennis Ideler" ideler.dennis@gmail.com/);
  t.is(stdout.split(EOL).filter(a => a.includes('git add-coauthor')).length, 2);
});

test('Prints help message', t => {
  const { stdout } = exec('git suggest-coauthors -h');

  t.regex(stdout, /usage/i);
  t.regex(stdout, /options/i);
  t.regex(stdout, /example/i);
});
