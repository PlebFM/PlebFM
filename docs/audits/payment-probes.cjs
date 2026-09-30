// The original audit probes targeted the old stateless payment handler. The
// replacement exercises the real routes and Mongo transactions in regression tests.
const { spawnSync } = require('node:child_process');
const result = spawnSync('pnpm', ['test'], {
  stdio: 'inherit',
  cwd: require('node:path').resolve(__dirname, '../..'),
});
process.exit(result.status ?? 1);
