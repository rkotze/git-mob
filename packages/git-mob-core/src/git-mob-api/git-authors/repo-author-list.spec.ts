import os from 'node:os';
import { Author } from '../author';
import { repoAuthorList } from './repo-author-list';

describe('Extract repository authors', function () {
  it('Given a list of authors extract the name and email', function () {
    const listOfAuthorsString = `   33\tRichard Kotze <rkotze@email.com>${os.EOL}   53\tTony Stark <tony@stark.com>`;
    const listOfAuthors = repoAuthorList(listOfAuthorsString);
    expect(listOfAuthors).toEqual([
      new Author('Richard Kotze', 'rkotze@email.com', 'rkem'),
      new Author('Tony Stark', 'tony@stark.com', 'tsst'),
    ]);
  });

  it('author has one name', function () {
    const listOfAuthorsString = `   33\tRichard <rkotze@email.com>${os.EOL}   53\tTony Stark <tony@stark.com>`;
    const listOfAuthors = repoAuthorList(listOfAuthorsString);
    expect(listOfAuthors).toEqual([
      new Author('Richard', 'rkotze@email.com', 'rem'),
      new Author('Tony Stark', 'tony@stark.com', 'tsst'),
    ]);
  });

  it('author uses a private GitHub email', function () {
    const listOfAuthorsString = `   33\tRichard <rkotze@email.com>${os.EOL}   53\tTony Stark <20342323+tony[bot]@users.noreply.github.com>`;
    const listOfAuthors = repoAuthorList(listOfAuthorsString);
    expect(listOfAuthors).toEqual([
      new Author('Richard', 'rkotze@email.com', 'rem'),
      new Author(
        'Tony Stark',
        '20342323+tony[bot]@users.noreply.github.com',
        'tsus'
      ),
    ]);
  });

  it('only one author on repository', function () {
    const listOfAuthorsString = `   33\tRichard Kotze <rkotze@email.com>`;
    const listOfAuthors = repoAuthorList(listOfAuthorsString);
    expect(listOfAuthors).toEqual([
      new Author('Richard Kotze', 'rkotze@email.com', 'rkem'),
    ]);
  });

  it('author has special characters in name', function () {
    const listOfAuthorsString = `   33\tRic<C4><8D>rd Kotze <rkotze@email.com>`;
    const listOfAuthors = repoAuthorList(listOfAuthorsString);
    expect(listOfAuthors).toEqual([
      new Author('Ric<C4><8D>rd Kotze', 'rkotze@email.com', 'rkem'),
    ]);
  });

  it('exclude if fails to match author pattern in list', function () {
    const listOfAuthorsString = `   33\tRichard Kotze <rkotze.email.com>`;
    const listOfAuthors = repoAuthorList(listOfAuthorsString);
    expect(listOfAuthors).not.toEqual([expect.any(Error)]);
  });
});
