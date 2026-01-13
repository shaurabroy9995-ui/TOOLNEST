// text-cleaner.js  –  fixed copy & module path
const undoStack = []; let undoPos = -1; const MAX_UNDO = 20;
function pushUndo(state) {
  if (undoPos < undoStack.length - 1) undoStack.splice(undoPos + 1);
  undoStack.push(state);
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  undoPos = undoStack.length - 1;
}
function runTextCleaner() {
  const input = document.getElementById('inputText');
  const output = document.getElementById('outputText');
  pushUndo(input.value);
  let t = input.value;
  if (document.getElementById('removeExtraSpaces').checked) t = t.replace(/\s+/g, ' ');
  if (document.getElementById('removePunctuation').checked) t = t.replace(/[^\w\s]/g, '');
  if (document.getElementById('removeLineBreaks').checked) t = t.replace(/\n+/g, ' ');
  if (document.getElementById('convertToLowercase').checked) t = t.toLowerCase();
  if (document.getElementById('convertToUppercase').checked) t = t.toUpperCase();
  if (document.getElementById('trimWhitespace').checked) t = t.trim();
  output.value = t;
  document.getElementById('charCount').textContent = t.length;
  document.getElementById('wordCount').textContent = t.split(/\s+/).filter(w => w).length;
  document.getElementById('lineCount').textContent = t.split('\n').length;
  document.getElementById('stats').style.display = 'grid';
}
async function copyOutput() {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(document.getElementById('outputText').value);
      showToast('Copied to clipboard', 'success');
      return;
    }
    const ta = document.createElement('textarea'); ta.value = document.getElementById('outputText').value; document.body.appendChild(ta); ta.select(); const ok = document.execCommand && document.execCommand('copy'); ta.remove(); if (ok) showToast('Copied to clipboard', 'success'); else showToast('Copy failed', 'error');
  } catch (err) { console.error(err); showToast('Copy failed', 'error'); }
}
function downloadText() {
  const blob = new Blob([document.getElementById('outputText').value], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cleaned.txt';
  a.click();
  showToast('Download started', 'success');
}
function clearAll() {
  document.getElementById('inputText').value = '';
  document.getElementById('outputText').value = '';
  document.getElementById('stats').style.display = 'none';
}
function undo() {
  if (undoPos <= 0) return;
  undoPos--;
  document.getElementById('inputText').value = undoStack[undoPos];
}
document.getElementById('copyOutBtn')?.addEventListener('click', copyOutput);
document.getElementById('downloadBtn')?.addEventListener('click', downloadText);
document.getElementById('clearBtn')?.addEventListener('click', clearAll);
document.getElementById('runCleanerBtn')?.addEventListener('click', runTextCleaner);
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
});
document.getElementById('inputText')?.addEventListener('input', e => pushUndo(e.target.value));


function toggleNav() {
  const nav = document.querySelector('nav');
  nav.classList.toggle('open');
  document.body.classList.toggle('nav-open');
}


function toggleNav() {
    const nav = document.querySelector('nav');
    const navToggle = document.querySelector('.nav-toggle');
    nav.classList.toggle('open');
    navToggle.classList.toggle('active');
}