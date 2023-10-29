import { EOL } from 'node:os';
import { jest } from '@jest/globals';
import { Author } from '../author';
import { gitMessage } from './index';

test('Append co-authors to .gitmessage append file mock', () => {
  const appendMock = jest.fn();
  const message = gitMessage('.git/.gitmessage', appendMock);
  message.writeCoAuthors([
    new Author('jd', 'Jane Doe', 'jane@findmypast.com'),
    new Author('fb', 'Frances Bar', 'frances-bar@findmypast.com'),
  ]);

  expect(appendMock).toBeCalledTimes(1);
  expect(appendMock).toBeCalledWith(
    expect.stringContaining('.gitmessage'),
    [
      EOL,
      EOL,
      'Co-authored-by: Jane Doe <jane@findmypast.com>',
      EOL,
      'Co-authored-by: Frances Bar <frances-bar@findmypast.com>',
    ].join('')
  );
});
