import test from 'ava';
import { exec } from '../test-helpers/index.js';

test('suggests potential coauthors', t => {
  const { stdout } = exec('git suggest-coauthors');

  t.regex(stdout, /Here are some suggestions/);
  t.regex(stdout, /git add-coauthor rk "Richard Kotze" rkotze@findmypast.com/);
  t.regex(stdout, /Paste any line above/);
});

test('-h prints help', t => {
  const { stdout } = exec('git suggest-coauthors -h');

  t.regex(stdout, /usage/i);
  t.regex(stdout, /options/i);
  t.regex(stdout, /example/i);
});
