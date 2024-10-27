const glob = require('glob');

const baseConfig = {
  entryPoints: [
    './src/git-mob.ts',
    './src/solo.ts',
    './src/git-add-coauthor.ts',
    './src/git-mob-print.ts',
    './src/git-suggest-coauthors.ts',
    './src/install/create-author-file.ts',
  ],
  mainFields: ['module', 'main'],
  bundle: true,
  platform: 'node',
  target: ['node16'],
  outdir: './dist',
  format: 'esm',
  plugins: [],
  logLevel: 'info',
  external: [
    'git-mob-core',
    '@inquirer/checkbox',
    'common-tags',
    'minimist',
    'update-notifier',
    'ava',
    'sinon',
    'coffee',
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
