#! /usr/bin/env node

const esbuild = require('esbuild');
const minimist = require('minimist');
const glob = require('glob');
const { gitMobConfig } = require('./git-mob.config');

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

const baseConfig = gitMobConfig;

baseConfig.minify = argv.minify;

if (argv.test) {
  const specFiles = glob.sync('./src/**/*.spec.*');
  baseConfig.entryPoints = [...baseConfig.entryPoints, ...specFiles];
  baseConfig.sourcemap = true;
}

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
  .catch(() => process.exit(1));
