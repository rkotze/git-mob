type Author = {
  name: string;
  email: string;
};

type AuthorList = Record<string, Author>;

type GitMobCoauthors = { coauthors: AuthorList };
