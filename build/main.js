const esbuild = require('esbuild');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2),{
  boolean: ['w'],

  alias: {
    w: 'watch'
  },
});

const baseConfig = {
  entryPoints: ['./src/git-mob.js'],
  mainFields: ['svelte', 'browser', 'module', 'main'],
  bundle: true,
  platform: "node",
  target: ["node14"],
  outdir: './dist',
  plugins: [],
  logLevel: 'info'
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
    console.log('watching...');
  })
  .catch(() => process.exit(1));
