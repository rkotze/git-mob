import { EOL } from 'node:os';
import { type Author } from '../author';

export enum AuthorTrailers {
  CoAuthorBy = 'Co-authored-by:',
  SignedOffBy = 'Signed-off-by:',
  ReviewedBy = 'Reviewed-by:',
}

function removeTrailers(txt: string): string {
  const trailers = Object.values(AuthorTrailers).join('|');
  const regex = new RegExp(`(\r\n|\r|\n){0,2}(${trailers}).*`, 'g');
  return txt.replaceAll(regex, '');
}

export function messageFormatter(txt: string, authors: Author[]): string {
  const message = removeTrailers(txt);

  if (authors && authors.length > 0) {
    const authorTrailerTxt = authors.map(author => author.format()).join(EOL);
    return [message, EOL, EOL, authorTrailerTxt].join('');
  }

  return message;
}
