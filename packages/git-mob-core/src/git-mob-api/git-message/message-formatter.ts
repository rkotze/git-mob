import { EOL } from 'node:os';
import { type Author } from '../author';

enum AuthorTrailers {
  CoAuthorBy = 'Co-authored-by:',
}

export function messageFormatter(
  txt: string,
  authors: Author[],
  trailer: AuthorTrailers = AuthorTrailers.CoAuthorBy
): string {
  const message = txt.replaceAll(/(\r\n|\r|\n){1,2}Co-authored-by.*/g, '');

  if (authors && authors.length > 0) {
    const authorTrailerTxt = authors.map(author => author.format()).join(EOL);
    return [message, EOL, EOL, authorTrailerTxt].join('');
  }

  return message;
}
