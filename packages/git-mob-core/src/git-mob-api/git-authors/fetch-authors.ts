import type { RequestOptions } from 'node:https';
import { httpFetch } from '../fetch/http-fetch';

const gitHubUserUrl = 'https://api.github.com/users';
const getHeaders: RequestOptions = {
  headers: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Accept: 'application/vnd.github.v3+json',
    method: 'GET',
  },
};

type GitHubUser = {
  id: number;
  login: string;
  name: string;
};

function validateGhUser(o: any): o is GitHubUser {
  return 'id' in o && 'login' in o && 'name' in o;
}

async function fetchAuthors(
  initialList: string[],
  fetch = httpFetch
): Promise<AuthorList> {
  const ghUsers = await Promise.all(
    initialList.map(async initials =>
      fetch(gitHubUserUrl + '/' + initials, getHeaders)
    )
  );

  const authorAuthorList: AuthorList = {};

  for (const ghUser of ghUsers) {
    throwStatusCodeErrors(ghUser.statusCode);

    if (validateGhUser(ghUser.data)) {
      const { login, id, name } = ghUser.data;
      authorAuthorList[login] = {
        name,
        email: `${id}+${login}@users.noreply.github.com`,
      };
    }
  }

  return authorAuthorList;
}

function throwStatusCodeErrors(statusCode: number | undefined) {
  if (statusCode === 404) {
    throw new Error('GitHub user not found!');
  }

  if (statusCode && statusCode > 299) {
    throw new Error(`Error failed to fetch GitHub user! Status code ${statusCode}.`);
  }
}

export { fetchAuthors };
