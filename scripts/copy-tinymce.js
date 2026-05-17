const fs = require('fs');
const path = require('path');

const src = fs.realpathSync(path.join(__dirname, '..', 'node_modules', 'tinymce'));
const dest = path.join(__dirname, '..', 'public', 'tinymce');

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true });
}

fs.cpSync(src, dest, { recursive: true });
console.log('✅ TinyMCE copied to public/tinymce');
