# Git Mob core

> Beta

The core API for managing Git Mob co-authors.

Shared between Git Mob CLI and Git Mob VS code.

```
npm i git-mob-core
```

## API

```TS
saveNewCoAuthors(authors): <Promise<Author[]>>
createCoAuthorsFile(): <Promise<boolean>>
getAllAuthors(): <Promise<Author[]>>
getPrimaryAuthor(): Author | undefined
getSelectedCoAuthors(allAuthors): Author[]
setCoAuthors(keys): <Promise<Author[]>>
setPrimaryAuthor(author): void
solo(): <Promise<void>>
updateGitTemplate(selectedAuthors): void
fetchGitHubAuthors(userNames: string[], userAgent: string): <Promise<Author[]>>
pathToCoAuthors(): <Promise<string>>
getConfig(prop: string): string | undefined
updateConfig(prop: string, value: string): void
repoAuthorList(authorFilter?: string): Promise<Author[] | undefined>
gitMobConfig = {
  localTemplate(): <Promise<boolean>>,
  fetchFromGitHub(): <Promise<boolean>>,
};

gitConfig = {
  getLocalCommitTemplate(): <Promise<string>>,
  getGlobalCommitTemplate(): <Promise<string>>,
};

gitRevParse = {
  insideWorkTree(): <Promise<string>>,
  topLevelDirectory(): <Promise<boolean>>,
};
```

## Author class

```TS
class Author;

// Properties
Author.key: string
Author.name: string
Author.email: string

//Methods
Author.format(): string
Author.toString(): string
```
