const os = require('os');
const test = require('ava');
const sinon = require('sinon');

const { gitMessage } = require('./index');

test('Append co-authors to .gitmessage append file mock', t => {
  const appendSpy = sinon.spy();
  const message = gitMessage(process.env.GITMOB_MESSAGE_PATH, appendSpy);
  message.writeCoAuthors([
    'Jane Doe <jane@findmypast.com>',
    'Frances Bar <frances-bar@findmypast.com>',
  ]);

  const argPath = appendSpy.getCall(0).args[0];
  const argContent = appendSpy.getCall(0).args[1];

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
