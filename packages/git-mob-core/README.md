# Git Mob core

> Beta

The core API for managing Git Mob co-authors.

Shared between Git Mob CLI and Git Mob VS code.

```
npm i git-mob-core
```

## API

### Environment variables

- `process.env.GITMOB_MESSAGE_PATH` set the primary path to Git message template
- `process.env.GITMOB_COAUTHORS_PATH` set the primary path to coauthors file

```TS
// Write actions
saveNewCoAuthors(authors: Author[]): <Promise<Author[]>>
createCoAuthorsFile(authors: Author[]): <Promise<boolean>>
updateGitTemplate(selectedAuthors?: Author[]): void
solo(): <Promise<void>>
setCoAuthors(keys: string[]): <Promise<Author[]>>

// Read actions
getAllAuthors(): <Promise<Author[]>>
getPrimaryAuthor(): <Promise<Author | undefined>>
getSelectedCoAuthors(allAuthors): <Promise<Author[]>>
setPrimaryAuthor(author: Author): void
repoAuthorList(authorFilter?: string): Promise<Author[] | undefined>
pathToCoAuthors(): <Promise<string>>

// GitHub
fetchGitHubAuthors(userNames: string[], userAgent: string): <Promise<Author[]>>
searchGitHubAuthors(query: string, userAgent: string): <Promise<Author[]>>

gitRevParse = {
  insideWorkTree(): <Promise<string>>,
  topLevelDirectory(): <Promise<boolean>>,
};
```

### Config

```TS
// Config manager for library
// supported prop: "processCwd" = set the directory to exec commands
getConfig(prop: string): string | undefined
updateConfig(prop: string, value: string): void

// Read GitMob properties from Git config file
gitMobConfig = {
  localTemplate(): <Promise<boolean>>,
  fetchFromGitHub(): <Promise<boolean>>,
};

// Read Git properties from Git config
gitConfig = {
  getLocalCommitTemplate(): <Promise<string>>,
  getGlobalCommitTemplate(): <Promise<string>>,
};
```

### Author class

Main class for Author data exchange between function.

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
