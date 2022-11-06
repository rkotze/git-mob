import os from 'node:os';
import test from 'ava';

import { configWarning } from './check-author';

test('does not print warning when config present', t => {
  const actual = configWarning({ name: 'John Doe', email: 'jdoe@example.com' });
  t.is(actual, undefined);
});

test('prints warning and missing config when one argument is missing', t => {
  const actual = configWarning({ name: 'John Doe', email: '' });
  const expected =
    'Warning: Missing information for the primary author. Set with:' +
    os.EOL +
    '$ git config --global user.email "jane@example.com"';
  t.is(actual, expected);
});

test('prints warning and missing config when both arguments are missing', t => {
  const actual = configWarning({ name: '', email: '' });
  const expected =
    'Warning: Missing information for the primary author. Set with:' +
    os.EOL +
    '$ git config --global user.name "Jane Doe"' +
    os.EOL +
    '$ git config --global user.email "jane@example.com"';
  t.is(actual, expected);
});
