import { EOL } from 'node:os';
import test from 'ava';
import { spy } from 'sinon';
import { gitMessage, gitMessagePath } from './index.js';

test('Append co-authors to .gitmessage append file mock', t => {
  const appendSpy = spy();
  const message = gitMessage(process.env.GITMOB_MESSAGE_PATH, appendSpy);
  message.writeCoAuthors([
    'Jane Doe <jane@findmypast.com>',
    'Frances Bar <frances-bar@findmypast.com>',
  ]);

  const [argPath, argContent] = appendSpy.getCall(0).args;

  t.true(appendSpy.calledOnce);
  t.true(argPath.includes('.gitmessage'));
  t.is(
    argContent,
    [
      EOL,
      EOL,
      'Co-authored-by: Jane Doe <jane@findmypast.com>',
      EOL,
      'Co-authored-by: Frances Bar <frances-bar@findmypast.com>',
    ].join('')
  );
});

test('gitMessagePath should return a stored path via env or gitconfig', t => {
  const { GITMOB_MESSAGE_PATH } = process.env;

  t.is(gitMessagePath(), GITMOB_MESSAGE_PATH);

  process.chdir('src');

  t.is(gitMessagePath(), GITMOB_MESSAGE_PATH);

  process.chdir('..');
});
