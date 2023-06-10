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
getConfig(prop: string): string | undefined
updateConfig(prop: string, value: string): void
class Author
```

## Author class

```TS
// Properties
Author.key: string
Author.name: string
Author.email: string

//Methods
Author.format(): string
Author.toString(): string
```
