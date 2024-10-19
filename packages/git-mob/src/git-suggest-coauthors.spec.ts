import test from 'ava';
import coffee from 'coffee';
import {
  setCoauthorsFile,
  deleteCoauthorsFile,
  readCoauthorsFile,
} from '../test-helpers/index.js';

const { before, after } = test;

before('setup', () => {
  setCoauthorsFile();
});

after.always('final cleanup', () => {
  deleteCoauthorsFile();
});

test('Suggests coauthors using repo contributors', async t => {
  const { stdout } = await coffee
    .spawn('git', ['suggest-coauthors'])
    .waitForPrompt(false)
    .writeKey('ENTER')
    .end();

  t.regex(stdout, /"Richard Kotze" richkotze@outlook.com/);
});

test('Filter suggestions of coauthors', async t => {
  const { stdout } = await coffee
    .spawn('git', ['suggest-coauthors', 'dennis i'])
    .waitForPrompt(false)
    .writeKey('SPACE', 'ENTER')
    .end();

  const coAuthorFile = readCoauthorsFile() || '';
  t.regex(stdout, /"Dennis Ideler" ideler.dennis@gmail.com/);
  t.regex(coAuthorFile, /ideler.dennis@gmail.com/);
  t.regex(coAuthorFile, /Dennis Ideler/);
  t.regex(coAuthorFile, /diid/);
});

test('Prints help message', async t => {
  const { stdout } = await coffee.spawn('git', ['suggest-coauthors', '-h']).end();

  t.regex(stdout, /usage/i);
  t.regex(stdout, /options/i);
  t.regex(stdout, /example/i);
});
