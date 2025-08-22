const fs = require('fs');
const path = require('path');

function renameJsToCjs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      renameJsToCjs(full);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      const target = full.replace(/\.js$/, '.cjs');
      fs.renameSync(full, target);
    }
  }
}

renameJsToCjs(path.join(__dirname, '..', 'dist', 'cjs'));
