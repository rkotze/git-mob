const os = require('os');
const test = require('ava');
const sinon = require('sinon');

const { gitMessage } = require('.');

test('Append co-authors to .gitmessage append file mock', t => {
  const appendSpy = sinon.spy();
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
      os.EOL,
      os.EOL,
      'Co-authored-by: Jane Doe <jane@findmypast.com>',
      os.EOL,
      'Co-authored-by: Frances Bar <frances-bar@findmypast.com>',
    ].join('')
  );
});
