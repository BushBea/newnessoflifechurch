const { spawnSync } = require('node:child_process');
const path = require('node:path');

const nodeDirectory = path.dirname(process.execPath);
const npmCli = 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js';
const result = spawnSync(process.execPath, [npmCli, ...process.argv.slice(2)], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  env: { ...process.env, PATH: `${nodeDirectory};${process.env.PATH}` },
});

process.exit(result.status ?? 1);
