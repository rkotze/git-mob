import type { RequestOptions } from 'node:https';
import { Author } from '../author';
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
  userAgentHeader: string,
  fetch = httpFetch
): Promise<Author[]> {
  if (!userAgentHeader) {
    throw new Error('Error no user-agent header string given.');
  }

  getHeaders.headers = {
    ...getHeaders.headers,
    'user-agent': userAgentHeader,
  };

  const ghUsers = await Promise.all(
    initialList.map(async initials =>
      fetch(gitHubUserUrl + '/' + initials, getHeaders)
    )
  );

  const authorAuthorList: Author[] = [];

  for (const ghUser of ghUsers) {
    throwStatusCodeErrors(ghUser.statusCode);

    if (validateGhUser(ghUser.data)) {
      const { login, id, name } = ghUser.data;
      authorAuthorList.push(
        new Author(login, name, `${id}+${login}@users.noreply.github.com`)
      );
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
