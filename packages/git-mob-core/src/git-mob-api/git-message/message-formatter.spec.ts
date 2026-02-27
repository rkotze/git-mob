import { EOL } from 'node:os';
import { Author } from '../author';
import { AuthorTrailers, messageFormatter } from './message-formatter';

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

test('MessageFormatter: Append mixed trailers to git message', () => {
  const txt = `git message`;
  const message = messageFormatter(txt, [
    new Author('jd', 'Jane Doe', 'jane@gitmob.com', AuthorTrailers.CoAuthorBy),
    new Author(
      'fb',
      'Frances Bar',
      'frances-bar@gitmob.com',
      AuthorTrailers.SignedOffBy
    ),
    new Author('ab', 'Alex Baz', 'alex-baz@gitmob.com', AuthorTrailers.ReviewedBy),
  ]);
  expect(message).toBe(
    [
      txt,
      EOL,
      EOL,
      'Co-authored-by: Jane Doe <jane@gitmob.com>',
      EOL,
      'Signed-off-by: Frances Bar <frances-bar@gitmob.com>',
      EOL,
      'Reviewed-by: Alex Baz <alex-baz@gitmob.com>',
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

test('MessageFormatter: Replace mixed trailers in the git message', () => {
  const firstLine = 'git message';
  const txt = [
    firstLine,
    EOL,
    EOL,
    'Co-authored-by: Jane Doe <jane@gitmob.com>',
    EOL,
    'Signed-off-by: Jane Doe <jane@gitmob.com>',
  ].join('');
  const message = messageFormatter(txt, [
    new Author(
      'fb',
      'Frances Bar',
      'frances-bar@gitmob.com',
      AuthorTrailers.SignedOffBy
    ),
    new Author('ab', 'Alex Baz', 'alex-baz@gitmob.com', AuthorTrailers.CoAuthorBy),
  ]);
  expect(message).toBe(
    [
      firstLine,
      EOL,
      EOL,
      'Signed-off-by: Frances Bar <frances-bar@gitmob.com>',
      EOL,
      'Co-authored-by: Alex Baz <alex-baz@gitmob.com>',
    ].join('')
  );
});

test('MessageFormatter: Replace co-author in the git message with no line break', () => {
  const firstLine = 'git message';
  const txt = [firstLine, 'Co-authored-by: Jane Doe <jane@gitmob.com>'].join('');
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
