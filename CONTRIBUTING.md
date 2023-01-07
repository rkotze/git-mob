# Contributing Guide

## Getting Started

1. Install dependencies
   ```
   npm install
   ```
1. Run linter and tests
   ```
   npm run checks
   ```

Other test commands

- Run a test file

  ```
  npm test ./dist/git-mob.spec.js
  ```

See [Ava](https://github.com/avajs/ava) for more options. This is for `git-mob` package.

Jest is used for `git-mob-core` package.

## Releasing

This section is for maintainers with push access to git-mob on npm.

Git Mob uses workspaces now and the flags below are needed to version each of the packages.

Read more about [workspaces](https://docs.npmjs.com/cli/v8/commands/npm-version?v=true#workspaces) for version command. Using workspaces flag runs the version command in all packages

1. Bump the version at the appropriate level (major, minor, patch); e.g.
   ```
   npm version patch --workspaces --include-workspace-root
   ```
2. Run the publish CI GitHub actions
3. Release notes added here https://github.com/rkotze/git-mob/releases
