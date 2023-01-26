const glob = require('glob');

const baseConfig = {
  entryPoints: [
    './src/git-mob.js',
    './src/solo.js',
    './src/git-add-coauthor.ts',
    './src/git-delete-coauthor.js',
    './src/git-edit-coauthor.js',
    './src/git-mob-print.js',
    './src/git-suggest-coauthors.js',
    './src/install/create-author-file.js',
  ],
  mainFields: ['module', 'main'],
  bundle: true,
  platform: 'node',
  target: ['node14'],
  outdir: './dist',
  plugins: [],
  logLevel: 'info',
  external: [
    'git-mob-core',
    'common-tags',
    'minimist',
    'update-notifier',
    'ava',
    'sinon',
  ],
};

function gitMobConfig(argv) {
  if (argv.test) {
    const specFiles = glob.sync('./src/**/*.spec.*');
    baseConfig.entryPoints = [...baseConfig.entryPoints, ...specFiles];
    baseConfig.sourcemap = true;
  }

  return baseConfig;
}

module.exports = { gitMobConfig };
