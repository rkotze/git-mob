# Contributing Guide

## Getting Started

1. Install dependencies
   ```
   npm install
   ```
1. Symlink the bin scripts
   ```
   npm link
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

  See [Ava](https://github.com/avajs/ava) for more options.

## Releasing

This section is for maintainers with push access to git-mob on npm.

Git Mob uses workspaces now and the flags below are needed to version each of the packages.

1. Bump the version at the appropriate level (major, minor, patch); e.g.
   ```
   npm version patch --workspaces --include-workspace-root
   ```
1. Push the version commit and tag
   ```
   git push --follow-tags
   ```
1. Run the publish CI GitHub actions
1. Release notes added here https://github.com/rkotze/git-mob/releases
