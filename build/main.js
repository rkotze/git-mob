const esbuild = require('esbuild');
const minimist = require('minimist');

// Flags
// -w: watch for file changes
// -m: minify code - use for publish
const argv = minimist(process.argv.slice(2),{
  boolean: ['w', 'm'],

  alias: {
    w: 'watch',
    m: 'minify'
  },
});

const baseConfig = {
  entryPoints: ['./src/git-mob.js', './src/solo.js'],
  mainFields: ['svelte', 'browser', 'module', 'main'],
  bundle: true,
  platform: "node",
  target: ["node14"],
  outdir: './dist',
  minify: argv.minify,
  plugins: [],
  logLevel: 'info',
  external: ['common-tags', 'minimist', 'update-notifier']
};

if(argv.watch){
  baseConfig.watch = {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error);
      else console.log('watch build succeeded:', result);
    },
  }
}

esbuild
  .build(baseConfig).then(result => {
    if(argv.watch){
      console.log('watching...');
    }
  })
  .catch(() => process.exit(1));
