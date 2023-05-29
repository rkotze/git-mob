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
getAllAuthors(): <Promise<Author[]>>
getPrimaryAuthor(): Author | null
getSelectedCoAuthors(allAuthors): Author[]
setCoAuthors(keys): <Promise<Author[]>>
setPrimaryAuthor(author): void
solo(): void
updateGitTemplate(selectedAuthors): void
fetchGitHubAuthors(userNames: string[], userAgent: string): <Promise<Author[]>>
pathToCoAuthors(): string

gitMobConfig = {
  localTemplate(): <Promise<boolean>>,
  fetchFromGitHub(): <Promise<boolean>>,
};

gitConfig = {
  getLocalCommitTemplate(): <Promise<string>>,
  getGlobalCommitTemplate(): <Promise<string>>,
};

gitRevParse = {
  insideWorkTree(): string,
  topLevelDirectory(): boolean,
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
