const glob = require('glob');

const baseConfig = {
  entryPoints: ['./src/index.js'],
  mainFields: ['main'],
  platform: 'node',
  target: ['node14'],
  outdir: './dist',
  plugins: [],
  logLevel: 'info',
  external: [],
};

function gitMobCoreConfig(argv) {
  if (argv.test) {
    const specFiles = glob.sync('./src/**/*(*.js|*.ts)');
    baseConfig.entryPoints = [...baseConfig.entryPoints, ...specFiles];
    baseConfig.sourcemap = true;
    baseConfig.bundle = false;
  }

  return baseConfig;
}

module.exports = { gitMobCoreConfig };
