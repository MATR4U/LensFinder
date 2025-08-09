/* CommonJS wrapper to run update_lenses.js in ESM project */
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const script = path.join(__dirname, 'update_lenses.js');
const res = spawnSync(process.execPath, ['--experimental-modules', script], { stdio: 'inherit' });
process.exit(res.status || 0);


