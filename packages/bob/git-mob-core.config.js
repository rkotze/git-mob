const glob = require('glob');

const baseConfig = {
  entryPoints: ['./src/index.ts'],
  mainFields: ['module', 'main'],
  platform: 'node',
  target: ['node16'],
  format: 'cjs',
  outdir: './dist',
  plugins: [],
  logLevel: 'info',
  bundle: true,
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
