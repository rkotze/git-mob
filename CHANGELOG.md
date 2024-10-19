# Change Log

Follows [Semantic Versioning](https://semver.org/).

## git-mob-core Next

## git-mob 3.3.0

### Added

- Update to `suggest-coauthors` will show a select interactive list using `inquirer/checkbox`. Select one or more authors to save. Reducing the number of steps to add new co-authors.

## git-mob-core 0.9.3

### Added

- Migrate git template `git-messages` function to TypeScript.

### Fixes

- When no path set for the commit template, default to the global template. Don't use a relative path.

## git-mob-core 0.9.2

### Fixes

- Global path to `.git-coauthors` can be overwritten by env var `GITMOB_COAUTHORS_PATH`.

## git-mob-core 0.9.1

### Fixes

- When creating a new `.git-coauthors` using the `createCoAuthorsFile` it is created only globally by providing internally the global path.

## git-mob-core 0.9.0

### Added

- Specify authors to save when creating the coAuthor file.
- Clean up unused features in author file: `coAuthor`, `author` format functions and no need for the `write` method.
- Remove unused old command API
- Convert `GitAuthors` function to TypeScript and define new internal type `CoAuthorSchema`.
- Breaking: `getSelectedCoAuthors` now returns a **promise** with type `Author[]`.
- Breaking: `getPrimaryAuthor` now returns a **promise** with type `Author`.
- Breaking: `setPrimaryAuthor` now returns a **promise** `void`.
- New: `searchGitHubAuthors` search by name and this will return `Author[]`.

## git-mob 3.2.0

### Added

- Integrate breaking changes in core API: `getPrimaryAuthor`, `getSelectedCoAuthors`, `setPrimaryAuthor`.
- New flag `-p` path will print out path to `.git-coauthors` file.

## git-mob 3.1.1

### Added

-- `git suggest-coauthors [author name or author email]` can filter by author name or email. Addresses [issue 90](https://github.com/rkotze/git-mob/issues/90)

### Refactored

- Remove legacy git-message API and replace it with git-mob-core `git-message` API
- Remove legacy git-add-coauthor API and replace it with git-mob-core `saveNewCoAuthors`
- Remove legacy git-suggest-coauthor API and replace it with git-mob-core `repoAuthorList`
- Migrated `git-suggest-coauthors` to TypeScript
- `git mob-print -i` uses git mob core to print out initials of selected co-authors
- Post install script to create global coauthor file uses `createCoAuthorsFile` from git mob core
- Migrated mob print file to TypeScript
- Removed legacy git mob commands no longer used.
- Removed legacy git commands no longer used.

## git-mob-core 0.8.2

### Added

- Added function to create a global coauthor file `createCoAuthorsFile`.

## git-mob-core 0.8.0

### Added

- Added `repoAuthorList` which will list all contributors from a repo
- Added filter to `repoAuthorList` which uses `--author` flag from `git shortlog`.

### Refactored

- Add new co-author module migrated to TypeScript and tested
- Change to async `topLevelDirectory`, `insideWorkTree` - may not be needed in future versions
- `resolve-git-message-path` migrated to TypeScript
- Changed to async `resolveGitMessagePath`, `setCommitTemplate`

## git-mob 3.0.0

### Added

- Now uses ESM modules and requires Node 16+ (Most parts work with Node 14)
- CI run tests in 3 Node environments 14, 16, 18
- Updated dependencies and dev dependencies to patch security issues
- Updated tests to support ESM

## git-mob-core 0.7.0

- Requires Node 16+
- Module systems support ESM and CJS

## git-mob-core 0.6.0

### Added

```ts
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

## git-mob 2.5.0

### Added

- Integrated git-mob-core for main `git mob` features
- Reduced the calls to `git` CLI to speed up command execution for `git mob`
- Convert src git-mob and spec files from JS to TS

## git-mob-core 0.5.0 10-06-2023

### Added

- Added config manager feature to set the child process cwd when needed see [issue 109](https://github.com/rkotze/git-mob/issues/109). New functions `getConfig` and `updateConfig`.

## git-mob 2.4.0 21-05-2023

### Added

- Integrated git-mob-core solo function
- Override the global `.git-coauthors` file with one specified in root folder of a Git repository. Thanks to @tlabeeuw

## git-mob-core 0.4.0 21-05-2023

### Added

- `updateGitTemplate` will keep global template up to date if local one is used for current repository.
- `pathToCoAuthors` will return the path to `.git-coauthors` file.
