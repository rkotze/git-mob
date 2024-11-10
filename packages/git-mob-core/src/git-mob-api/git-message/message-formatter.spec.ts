import { EOL } from 'node:os';
import { Author } from '../author';
import { messageFormatter } from './message-formatter';

test('MessageFormatter: No authors to append to git message', () => {
  const txt = `git message`;
  const message = messageFormatter(txt, []);

  expect(message).toBe(txt);
});

test('MessageFormatter: Append co-authors to git message', () => {
  const txt = `git message`;
  const message = messageFormatter(txt, [
    new Author('jd', 'Jane Doe', 'jane@gitmob.com'),
    new Author('fb', 'Frances Bar', 'frances-bar@gitmob.com'),
  ]);

  expect(message).toBe(
    [
      txt,
      EOL,
      EOL,
      'Co-authored-by: Jane Doe <jane@gitmob.com>',
      EOL,
      'Co-authored-by: Frances Bar <frances-bar@gitmob.com>',
    ].join('')
  );
});

test('MessageFormatter: Replace co-author in the git message', () => {
  const firstLine = 'git message';
  const txt = [
    firstLine,
    EOL,
    EOL,
    'Co-authored-by: Jane Doe <jane@gitmob.com>',
  ].join('');
  const message = messageFormatter(txt, [
    new Author('fb', 'Frances Bar', 'frances-bar@gitmob.com'),
  ]);

  expect(message).toBe(
    [
      firstLine,
      EOL,
      EOL,
      'Co-authored-by: Frances Bar <frances-bar@gitmob.com>',
    ].join('')
  );
});
