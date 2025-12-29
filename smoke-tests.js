const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, '..', 'tools');
const jsDir = path.join(__dirname, '..', 'JS', 'TOOLS-JS');

const checks = [
  {
    file: 'base64-tools.html',
    requires: ['#base64Input', '#base64Output', 'src="../JS/TOOLS-JS/base64-tools.js"']
  },
  {
    file: 'text-cleaner.html',
    requires: ['#inputText', '#outputText', 'src="../JS/TOOLS-JS/text-cleaner.js"']
  },
  {
    file: 'qr-generator.html',
    requires: ['#qrText', '#qrTarget', 'src="../JS/TOOLS-JS/qr-generator.js"']
  },
  {
    file: 'image-tools.html',
    requires: ['#imageFile', '#imageFile2', 'src="../JS/TOOLS-JS/image-tools.js"']
  },
  {
    file: 'text-document-tools.html',
    requires: ['#pdfFiles', '#pdfFilesSplit', 'src="../JS/TOOLS-JS/PDFMerger.js"']
  }
];

let allOk = true;
console.log('Running quick smoke checks on tool pages...');
for (const c of checks) {
  const p = path.join(toolsDir, c.file);
  if (!fs.existsSync(p)) {
    console.error(`[FAIL] Missing file: ${c.file}`);
    allOk = false;
    continue;
  }
  const content = fs.readFileSync(p, 'utf8');
  for (const r of c.requires) {
    const name = r.startsWith('#') ? r.slice(1) : r;
    const idPattern = `id=\"${name}\"`;
    const found = content.indexOf(r) !== -1 || content.indexOf(idPattern) !== -1 || content.indexOf(name) !== -1;
    if (!found) {
      console.error(`[FAIL] ${c.file} does not include required string: ${r}`);
      allOk = false;
    }
  }
}

if (allOk) {
  console.log('\nAll smoke checks passed ✅');
  process.exit(0);
} else {
  console.error('\nSome smoke checks failed ❌');
  process.exit(2);
}