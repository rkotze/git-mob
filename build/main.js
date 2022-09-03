const esbuild = require('esbuild');
const minimist = require('minimist');
const glob = require('glob');

// Flags
// -w: watch for file changes
// -m: minify code - use for publish
const argv = minimist(process.argv.slice(2), {
  boolean: ['w', 'm', 't'],

  alias: {
    w: 'watch',
    m: 'minify',
    t: 'test'
  },
});

const baseConfig = {
  entryPoints: [
    './src/git-mob.js',
    './src/solo.js',
    './src/git-add-coauthor.js',
    './src/git-delete-coauthor.js',
    './src/git-edit-coauthor.js',
    './src/git-mob-print.js',
    './src/git-suggest-coauthors.js',
    './src/install/create-author-file.js'
  ],
  mainFields: ['module', 'main'],
  bundle: true,
  platform: 'node',
  target: ['node14'],
  outdir: './dist',
  minify: argv.minify,
  plugins: [],
  logLevel: 'info',
  external: ['common-tags',
    'minimist',
    'update-notifier',
    'ava',
    'sinon',
    'tempy']
};

if (argv.test) {
  const specFiles = glob.sync('./src/**/*.spec.js');
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
  .build(baseConfig).then(_ => {
    if (argv.watch) {
      console.log('watching...');
    }
  })
  .catch(() => process.exit(1));
