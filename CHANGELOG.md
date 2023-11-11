# Change Log

Follows [Semantic Versioning](https://semver.org/).

## git-mob Next

### Added

- Remove legacy git-message API and replace it with git-mob-core `git-message` API
- Remove legacy git-add-coauthor API and replace it with git-mob-core `saveNewCoAuthors`

## git-mob-core next

- Add new co-author module migrated to TypeScript and tested

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
