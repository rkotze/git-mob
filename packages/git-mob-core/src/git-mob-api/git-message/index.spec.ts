import { EOL } from 'node:os';
import { readFile, writeFile } from 'node:fs/promises';
import { Author } from '../author.js';
import { gitMessage } from './index.js';

jest.mock('node:fs/promises');

test('Append co-authors to .gitmessage append file mock', async () => {
  const message = gitMessage('.fake/.gitmessage');
  await message.writeCoAuthors([
    new Author('jd', 'Jane Doe', 'jane@findmypast.com'),
    new Author('fb', 'Frances Bar', 'frances-bar@findmypast.com'),
  ]);

  expect(readFile).toHaveBeenCalledTimes(1);
  expect(writeFile).toHaveBeenCalledTimes(1);
  expect(writeFile).toHaveBeenCalledWith(
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
