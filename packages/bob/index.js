#! /usr/bin/env node

const esbuild = require('esbuild');
const minimist = require('minimist');
const { gitMobConfig } = require('./git-mob.config');
const { gitMobCoreConfig } = require('./git-mob-core.config');

// Flags
// -w: watch for file changes
// -m: minify code - use for publish
// -t: test flow to include sourcemaps
const argv = minimist(process.argv.slice(2), {
  boolean: ['w', 'm', 't', 'c'],

  alias: {
    w: 'watch',
    m: 'minify',
    t: 'test',
    c: 'config',
  },
});

let baseConfig = gitMobConfig(argv);

if (argv.config === 'core') {
  baseConfig = gitMobCoreConfig(argv);
}

baseConfig.minify = argv.minify;

if (argv.watch) {
  baseConfig.watch = {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error);
      else console.log('watch build succeeded:', result);
    },
  };
}

esbuild
  .build(baseConfig)
  .then(_ => {
    if (argv.watch) {
      console.log('watching...');
    }
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(() => process.exit(1));
