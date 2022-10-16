import test from 'ava';
import { createSandbox, assert } from 'sinon';
import type { BasicResponse } from '../http-fetch';
import { fetchAuthors } from './fetch-authors';

// const gitHubAuthors = {
//   rkotze: {
//     name: 'Richard',
//     email: 'rich@gitmob.com',
//   },
//   dideler: {
//     name: 'Denis',
//     email: 'denis@gitmob.com',
//   },
// };

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

test('Query for one GitHub user and check RESTFUL api', async t => {
  const sandbox = createSandbox();
  const httpFetchStub = sandbox
    .stub()
    .resolves(buildBasicResponse(ghRkotzeResponse));

  await fetchAuthors(['rkotze'], httpFetchStub);

  t.notThrows(() => {
    assert.calledWith(httpFetchStub, 'https://api.github.com/users/rkotze', headers);
  }, 'Not called with ["rkotze"]');

  sandbox.restore();
});

test('Query for one GitHub user and return user in AuthorList', async t => {
  const sandbox = createSandbox();
  const httpFetchStub = sandbox
    .stub()
    .resolves(buildBasicResponse(ghDidelerResponse));

  const actualAuthorList = await fetchAuthors(['dideler'], httpFetchStub);

  t.deepEqual(actualAuthorList, {
    dideler: {
      name: 'Dennis',
      email: '345+dideler@users.noreply.github.com',
    },
  });

  sandbox.restore();
});
