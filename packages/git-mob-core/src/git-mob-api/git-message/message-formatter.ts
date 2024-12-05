import { EOL } from 'node:os';
import { type Author } from '../author';

export enum AuthorTrailers {
  CoAuthorBy = 'Co-authored-by:',
}

export function messageFormatter(txt: string, authors: Author[]): string {
  const trailers = AuthorTrailers.CoAuthorBy;
  const regex = new RegExp(`(\r\n|\r|\n){0,2}(${trailers}).*`, 'g');
  const message = txt.replaceAll(regex, '');

  if (authors && authors.length > 0) {
    const authorTrailerTxt = authors.map(author => author.format()).join(EOL);
    return [message, EOL, EOL, authorTrailerTxt].join('');
  }

  return message;
}
