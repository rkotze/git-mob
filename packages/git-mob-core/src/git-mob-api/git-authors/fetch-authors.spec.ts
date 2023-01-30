import type { BasicResponse } from '../fetch/http-fetch';
import { httpFetch } from '../fetch/http-fetch';
import { fetchAuthors } from './fetch-authors';

jest.mock('../fetch/http-fetch');
const mockedFetch = jest.mocked(httpFetch);

const ghRkotzeResponse = {
  id: 123,
  login: 'rkotze',
  name: 'Richard Kotze',
};

const ghDidelerResponse = {
  id: 345,
  login: 'dideler',
  name: 'Dennis',
};

function buildBasicResponse(ghResponse: Record<string, unknown>): BasicResponse {
  return {
    statusCode: 200,
    data: ghResponse,
  };
}

const headers = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Accept: 'application/vnd.github.v3+json',
  method: 'GET',
};

test('Query for one GitHub user and check RESTful url', async () => {
  mockedFetch.mockResolvedValue(buildBasicResponse(ghRkotzeResponse));

  await fetchAuthors(['rkotze']);

  expect(mockedFetch).toHaveBeenCalledWith('https://api.github.com/users/rkotze', {
    headers,
  });
});

test('Query for one GitHub user and return in AuthorList', async () => {
  mockedFetch.mockResolvedValue(buildBasicResponse(ghDidelerResponse));

  const actualAuthorList = await fetchAuthors(['dideler']);

  expect(actualAuthorList).toEqual([
    {
      key: 'dideler',
      name: 'Dennis',
      email: '345+dideler@users.noreply.github.com',
    },
  ]);
});

test('Query for two GitHub users and build AuthorList', async () => {
  mockedFetch
    .mockResolvedValueOnce(buildBasicResponse(ghDidelerResponse))
    .mockResolvedValueOnce(buildBasicResponse(ghRkotzeResponse));

  const actualAuthorList = await fetchAuthors(['dideler', 'rkotze']);

  expect(actualAuthorList).toEqual([
    {
      key: 'dideler',
      name: 'Dennis',
      email: '345+dideler@users.noreply.github.com',
    },
    {
      key: 'rkotze',
      name: 'Richard Kotze',
      email: '123+rkotze@users.noreply.github.com',
    },
  ]);
});

test('Http status code 404 throws error', async () => {
  mockedFetch.mockResolvedValue({
    statusCode: 404,
    data: {},
  });

  await expect(fetchAuthors(['notaUser'])).rejects.toThrow(/GitHub user not found!/);
});

test('Http status code not 200 or 404 throws generic error', async () => {
  mockedFetch.mockResolvedValue({
    statusCode: 500,
    data: {},
  });

  await expect(fetchAuthors(['badrequestuser'])).rejects.toThrow(
    /Error failed to fetch GitHub user! Status code 500./
  );
});
