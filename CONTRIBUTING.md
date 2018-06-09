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
1. Run tests
   ```
   npm test
   ```

## Releasing

This section is for maintainers with push access to git-mob on npm.

1. Bump the version at the appropriate level (major, minor, patch); e.g.
   ```
   npm version patch
   ```
2. Publish the package
   ```
   npm publish
   ```
3. Add release notes at https://github.com/findmypast-oss/git-mob/releases