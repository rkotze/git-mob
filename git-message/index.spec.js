const os = require('os');
const test = require('ava');
const sinon = require('sinon');

const { gitMessage } = require('./index');

test('Append co-authors to .git-message', t => {
  const appendSpy = sinon.spy();
  const message = gitMessage(appendSpy);
  message.writeCoAuthors([
    'Jane Doe <jane@findmypast.com>',
    'Frances Bar <frances-bar@findmypast.com>',
  ]);

  t.true(appendSpy.calledOnce);
  const argPath = appendSpy.getCall(0).args[0];
  const argContent = appendSpy.getCall(0).args[1];

  t.true(argPath.includes('.git-message'));
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
