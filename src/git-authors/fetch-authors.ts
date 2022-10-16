import { httpFetch } from '../http-fetch';

const gitHubUserUrl = 'https://api.github.com/users';
const getHeaders = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Accept: 'application/vnd.github.v3+json',
  method: 'GET',
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
  initials: string[],
  fetch = httpFetch
): Promise<AuthorList> {
  const ghUser = await fetch(gitHubUserUrl + '/' + initials[0], getHeaders);
  if (validateGhUser(ghUser.data)) {
    const { login, id, name } = ghUser.data;
    return {
      [login]: {
        name,
        email: `${id}+${login}@users.noreply.github.com`,
      },
    };
  }

  return {};
}

export { fetchAuthors };
