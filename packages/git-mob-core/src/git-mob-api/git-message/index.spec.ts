import { EOL } from 'node:os';
import { jest } from '@jest/globals';
import { Author } from '../author.js';
import { gitMessage } from './index.js';

test('Append co-authors to .gitmessage append file mock', async () => {
  const appendMock = jest.fn(async () => undefined);
  const message = gitMessage('.git/.gitmessage', appendMock);
  await message.writeCoAuthors([
    new Author('jd', 'Jane Doe', 'jane@findmypast.com'),
    new Author('fb', 'Frances Bar', 'frances-bar@findmypast.com'),
  ]);

  expect(appendMock).toHaveBeenCalledTimes(1);
  expect(appendMock).toHaveBeenCalledWith(
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
