// Image tools — consolidated, uses showToast and DOM wiring
function mimeTypeForFormat(format) {
  if (!format) return 'image/png';
  format = format.toLowerCase();
  if (format === 'jpeg' || format === 'jpg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  if (format === 'webp') return 'image/webp';
  if (format === 'gif') return 'image/gif';
  return 'image/png';
}

function processImageFile(file, width = null, height = null, format = 'png', quality = 0.9) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let targetW = width || null;
      let targetH = height || null;
      if (!targetW && !targetH) {
        targetW = img.naturalWidth;
        targetH = img.naturalHeight;
      } else if (!targetW) {
        targetW = Math.round(img.naturalWidth * (targetH / img.naturalHeight));
      } else if (!targetH) {
        targetH = Math.round(img.naturalHeight * (targetW / img.naturalWidth));
      }
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const mime = mimeTypeForFormat(format);
      const outMime = mime === 'image/gif' ? 'image/png' : mime;
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Failed to generate image'));
        resolve({ blob, width: targetW, height: targetH, mime: outMime });
      }, outMime, quality);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

async function resizeImage() {
  const file = document.getElementById('imageFile')?.files[0];
  if (!file) { showToast('Select an image', 'error'); return; }
  const width = parseInt(document.getElementById('imgWidth').value) || null;
  const height = parseInt(document.getElementById('imgHeight').value) || null;
  const format = document.getElementById('imgFormat')?.value || 'png';
  const quality = parseFloat(document.getElementById('imgQuality')?.value) || 0.9;
  try {
    const res = await processImageFile(file, width, height, format, quality);
    setResult(res.blob, res.width, res.height);
    showToast('Image processed', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Unable to process image', 'error');
  }
}

async function convertImage() {
  const file = document.getElementById('imageFile2')?.files[0];
  if (!file) { showToast('Select an image', 'error'); return; }
  const format = document.getElementById('imgFormat')?.value || 'png';
  const quality = parseFloat(document.getElementById('imgQuality')?.value) || 0.9;
  try {
    const res = await processImageFile(file, null, null, format, quality);
    setResult(res.blob, res.width, res.height);
    showToast('Image converted', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Unable to convert image', 'error');
  }
}

function setResult(blob, width, height) {
  const url = URL.createObjectURL(blob);
  let img = document.getElementById('imagePreview');
  if (!img) {
    img = document.createElement('img');
    img.id = 'imagePreview';
    img.style.maxWidth = '100%';
    document.getElementById('imageResults')?.appendChild(img);
  } else if (img.dataset.objectUrl) {
    URL.revokeObjectURL(img.dataset.objectUrl);
    delete img.dataset.objectUrl;
  }
  img.src = url;
  img.dataset.objectUrl = url;
  document.getElementById('imageResults').style.display = 'block';
}

function downloadImage() {
  const img = document.getElementById('imagePreview');
  if (!img) { showToast('Nothing to download', 'error'); return; }
  fetch(img.src)
    .then(r => r.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'image.' + (document.getElementById('imgFormat')?.value || 'png');
      a.click();
      showToast('Download started', 'success');
    }).catch(err => { console.error(err); showToast('Download failed', 'error'); });
}

function clearImages() {
  document.getElementById('imageFile').value = '';
  document.getElementById('imageFile2').value = '';
  document.getElementById('imgWidth').value = '';
  document.getElementById('imgHeight').value = '';
  document.getElementById('imageResults').style.display = 'none';
  const img = document.getElementById('imagePreview');
  if (img) { if (img.dataset.objectUrl) URL.revokeObjectURL(img.dataset.objectUrl); img.remove(); }
}

// Expose globals
window.resizeImage = resizeImage;
window.convertImage = convertImage;
window.downloadImage = downloadImage;
window.clearImages = clearImages;

// Preview
function showSelectedPreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const nameEl = document.getElementById(previewId + 'Name');
  if (!input || !preview) return;
  const file = input.files[0];
  if (!file) { if (preview.dataset.objectUrl) { URL.revokeObjectURL(preview.dataset.objectUrl); delete preview.dataset.objectUrl; } preview.style.display = 'none'; preview.src = ''; if (nameEl) nameEl.textContent = ''; return; }
  if (preview.dataset.objectUrl) { URL.revokeObjectURL(preview.dataset.objectUrl); }
  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.dataset.objectUrl = url;
  preview.style.display = 'block';
  if (nameEl) nameEl.textContent = file.name;
}

// attach change listeners
document.getElementById('imageFile')?.addEventListener('change', () => showSelectedPreview('imageFile', 'selectedPreview'));
document.getElementById('imageFile2')?.addEventListener('change', () => showSelectedPreview('imageFile2', 'selectedPreview2'));

// quality sync
const qRange = document.getElementById('imgQuality');
const qNumber = document.getElementById('imgQualityNumber');
if (qRange && qNumber) { qRange.addEventListener('input', () => qNumber.value = qRange.value); qNumber.addEventListener('input', () => qRange.value = qNumber.value); }

// format warning
document.getElementById('imgFormat')?.addEventListener('change', (e) => { const warn = document.getElementById('formatWarning'); if (!warn) return; warn.style.display = e.target.value === 'gif' ? 'block' : 'none'; });

// worker support (optional, used elsewhere if present)
let worker = null;
function getWorker() { if (worker) return worker; try { const scriptUrl = new URL('../assets/js/workers/image-worker.js', location.href).href; worker = new Worker(scriptUrl, { type: 'module' }); return worker; } catch (err) { console.warn('Worker not available', err); return null; } }

function useWorkerForFile(file) { if (!file) return false; const useWorkerCheckbox = document.getElementById('useWorker'); const enabled = useWorkerCheckbox && useWorkerCheckbox.checked; const sizeThreshold = 2 * 1024 * 1024; return enabled && file.size >= sizeThreshold && typeof Worker !== 'undefined'; }

function terminateWorker() { if (worker) { try { worker.terminate(); } catch (e) { } worker = null; } }
window.addEventListener('beforeunload', () => { terminateWorker(); });
window.terminateImageWorker = terminateWorker;

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