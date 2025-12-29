// base64-tools.js  –  fixed module path & copy
const input = document.getElementById('base64Input');
const output = document.getElementById('base64Output');

function base64Encode() {
  try {
    output.value = btoa(unescape(encodeURIComponent(input.value)));
    showToast('Encoded to Base64', 'success');
  } catch (err) {
    console.error(err);
    showToast('Encode failed', 'error');
  }
}
function base64Decode() {
  try { output.value = decodeURIComponent(escape(atob(input.value))); showToast('Decoded from Base64', 'success'); }
  catch (err) { console.error(err); showToast('Invalid Base64 string', 'error'); }
}
function clearBase64() { input.value = output.value = ''; showToast('Cleared', 'info'); }
async function copyRes() {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(output.value);
      showToast('Copied to clipboard', 'success');
      return;
    }
    // fallback
    const ta = document.createElement('textarea');
    ta.value = output.value;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand && document.execCommand('copy');
    ta.remove();
    if (ok) showToast('Copied to clipboard', 'success');
    else showToast('Copy failed', 'error');
  } catch (err) { console.error(err); showToast('Copy failed', 'error'); }
}
document.getElementById('encodeBtn')?.addEventListener('click', base64Encode);
document.getElementById('decodeBtn')?.addEventListener('click', base64Decode);
document.getElementById('clearBase64Btn')?.addEventListener('click', clearBase64);
document.getElementById('copyBase64Btn')?.addEventListener('click', copyRes);