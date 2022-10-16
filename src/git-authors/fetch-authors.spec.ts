import test from 'ava';
import { createSandbox, assert } from 'sinon';
import type { SinonSandbox } from 'sinon';
import type { BasicResponse } from '../http-fetch';
import { fetchAuthors } from './fetch-authors';

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

let sandbox: SinonSandbox;

test.before(() => {
  sandbox = createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('Query for one GitHub user and check RESTful url', async t => {
  const httpFetchStub = sandbox
    .stub()
    .resolves(buildBasicResponse(ghRkotzeResponse));

  await fetchAuthors(['rkotze'], httpFetchStub);

  t.notThrows(() => {
    assert.calledWith(httpFetchStub, 'https://api.github.com/users/rkotze', headers);
  }, 'Not called with ["rkotze"]');
});

test('Query for one GitHub user and return in AuthorList', async t => {
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
});

test('Query for two GitHub users and build AuthorList', async t => {
  const httpFetchStub = sandbox
    .stub()
    .onCall(0)
    .resolves(buildBasicResponse(ghDidelerResponse))
    .onCall(1)
    .resolves(buildBasicResponse(ghRkotzeResponse));

  const actualAuthorList = await fetchAuthors(['dideler', 'rkotze'], httpFetchStub);

  t.deepEqual(actualAuthorList, {
    dideler: {
      name: 'Dennis',
      email: '345+dideler@users.noreply.github.com',
    },
    rkotze: {
      name: 'Richard Kotze',
      email: '123+rkotze@users.noreply.github.com',
    },
  });
});
