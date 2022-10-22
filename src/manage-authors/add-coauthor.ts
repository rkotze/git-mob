import { gitAuthors } from '../git-authors';

async function addCoauthor([key, name, email]: [
  string,
  string,
  string
]): Promise<boolean> {
  const coauthors = gitAuthors();
  const authorList = (await coauthors.read()) as { coauthors: AuthorList };
  if (key in authorList.coauthors) {
    throw new Error(key + ' already exists in .git-coauthors');
  } else {
    authorList.coauthors[key] = { name, email };
    await coauthors.overwrite(authorList);
    return true;
  }
}

export { addCoauthor };
