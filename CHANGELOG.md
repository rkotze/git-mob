# Change Log

Follows [Semantic Versioning](https://semver.org/).

## git-mob-core 0.6.0 current

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

## git-mob 2.5.0 current

### Added

- Integrated git-mob-core for main `git mob` features

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
