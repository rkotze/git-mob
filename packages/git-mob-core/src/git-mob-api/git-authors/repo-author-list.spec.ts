import os from 'node:os';
import { getRepoAuthors } from '../exec-command';
import { Author } from '../author';
import { repoAuthorList } from './repo-author-list';

jest.mock('../exec-command');
const mockedGetRepoAuthors = jest.mocked(getRepoAuthors);

describe('Extract repository authors', function () {
  it('Given a list of authors extract the name and email', async function () {
    mockedGetRepoAuthors.mockResolvedValueOnce(
      `   33\tRichard Kotze <rkotze@email.com>${os.EOL}   53\tTony Stark <tony@stark.com>`
    );
    const listOfAuthors = await repoAuthorList();
    expect(listOfAuthors).toEqual([
      new Author('rkrk', 'Richard Kotze', 'rkotze@email.com'),
      new Author('tsto', 'Tony Stark', 'tony@stark.com'),
    ]);
  });

  it('author has one name', async function () {
    mockedGetRepoAuthors.mockResolvedValueOnce(
      `   33\tRichard <rkotze@email.com>${os.EOL}   53\tTony Stark <tony@stark.com>`
    );
    const listOfAuthors = await repoAuthorList();
    expect(listOfAuthors).toEqual([
      new Author('rrk', 'Richard', 'rkotze@email.com'),
      new Author('tsto', 'Tony Stark', 'tony@stark.com'),
    ]);
  });

  it('author uses a private GitHub email', async function () {
    mockedGetRepoAuthors.mockResolvedValueOnce(
      `   33\tRichard <rkotze@email.com>${os.EOL}   53\tTony Stark <20342323+tony[bot]@users.noreply.github.com>`
    );
    const listOfAuthors = await repoAuthorList();
    expect(listOfAuthors).toEqual([
      new Author('rrk', 'Richard', 'rkotze@email.com'),
      new Author(
        'ts20',
        'Tony Stark',
        '20342323+tony[bot]@users.noreply.github.com'
      ),
    ]);
  });

  it('only one author on repository', async function () {
    mockedGetRepoAuthors.mockResolvedValueOnce(
      `   33\tRichard Kotze <rkotze@email.com>`
    );
    const listOfAuthors = await repoAuthorList();
    expect(listOfAuthors).toEqual([
      new Author('rkrk', 'Richard Kotze', 'rkotze@email.com'),
    ]);
  });

  it('author has special characters in name', async function () {
    mockedGetRepoAuthors.mockResolvedValueOnce(
      `   33\tRic<C4><8D>rd Kotze <rkotze@email.com>`
    );
    const listOfAuthors = await repoAuthorList();
    expect(listOfAuthors).toEqual([
      new Author('rkrk', 'Ric<C4><8D>rd Kotze', 'rkotze@email.com'),
    ]);
  });

  it('exclude if fails to match author pattern in list', async function () {
    mockedGetRepoAuthors.mockResolvedValueOnce(
      `   33\tRichard Kotze <rkotze.email.com`
    );
    const listOfAuthors = await repoAuthorList();
    expect(listOfAuthors).toEqual(undefined);
  });
});
