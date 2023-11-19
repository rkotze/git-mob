import test from 'ava';
import {
  addAuthor,
  addCoAuthor,
  removeCoAuthors,
  safelyRemoveGitConfigSection,
  deleteGitMessageFile,
  exec,
  setCoauthorsFile,
  deleteCoauthorsFile,
  setup,
  tearDown,
  unsetCommitTemplate,
} from '../test-helpers/index.js';

const { before, after, afterEach } = test;

before('setup', () => {
  setup();
  setCoauthorsFile();
});

after.always('final cleanup', () => {
  deleteCoauthorsFile();
  deleteGitMessageFile();
  tearDown();
});

afterEach.always('each cleanup', () => {
  safelyRemoveGitConfigSection('user');
  safelyRemoveGitConfigSection('git-mob');
  safelyRemoveGitConfigSection('commit');
});

test('Print a list of selected author keys', t => {
  addAuthor('John Doe', 'jdoe@example.com');
  addCoAuthor('Jane Doe', 'jane@findmypast.com');
  addCoAuthor('Elliot Alderson', 'ealderson@findmypast.com>');
  const { stdout } = exec('git mob-print -i');

  t.regex(stdout, /jd,ea/);

  unsetCommitTemplate();
  removeCoAuthors();
});
