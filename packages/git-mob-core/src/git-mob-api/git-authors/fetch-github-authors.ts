import type { RequestOptions } from 'node:https';
import { Author } from '../author.js';
import { httpFetch } from '../fetch/http-fetch.js';

const gitHubUserUrl = 'https://api.github.com/users';
const gitHubSearchUserUrl = 'https://api.github.com/search/users';
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
  name?: string;
};

type GitHubSearchUser = {
  items: GitHubUser[];
};

function validateGhUser(o: any): o is GitHubUser {
  return 'id' in o && 'login' in o && 'name' in o;
}

async function fetchGitHubAuthors(
  usernames: string[],
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
    usernames.map(async usernames =>
      fetch(gitHubUserUrl + '/' + usernames, getHeaders)
    )
  );

  const authorAuthorList: Author[] = [];

  for (const ghUser of ghUsers) {
    throwStatusCodeErrors(ghUser.statusCode);

    if (validateGhUser(ghUser.data)) {
      const { login, id, name } = ghUser.data;
      authorAuthorList.push(
        new Author(login, name || login, `${id}+${login}@users.noreply.github.com`)
      );
    }
  }

  return authorAuthorList;
}

async function searchGitHubAuthors(
  query: string,
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

  const ghSearchUser = await fetch(gitHubSearchUserUrl + '?q=' + query, getHeaders);
  throwStatusCodeErrors(ghSearchUser.statusCode);

  const results = ghSearchUser.data as GitHubSearchUser;

  const gitHubUsernames = results.items.map(ghUser => ghUser.login);

  return fetchGitHubAuthors(gitHubUsernames, userAgentHeader, fetch);
}

function throwStatusCodeErrors(statusCode: number | undefined) {
  if (statusCode === 404) {
    throw new Error('GitHub user not found!');
  }

  if (statusCode && statusCode > 299) {
    throw new Error(`Error failed to fetch GitHub user! Status code ${statusCode}.`);
  }
}

export { fetchGitHubAuthors, searchGitHubAuthors };
