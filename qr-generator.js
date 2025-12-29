// qr-generator.js  –  fixed CDN & download
let qrCanvas = null;   // will hold the <canvas> element

function generateQRCode() {
  const text = document.getElementById('qrText').value.trim();
  if (!text) { showToast('Please enter content', 'error'); return; }
  document.getElementById('qrError').style.display = 'none';
  const target = document.getElementById('qrTarget');
  target.innerHTML = '';                                    // clear old code

  // use QRCode library if loaded, else simple API image
  if (typeof QRCode !== 'undefined') {
    new QRCode(target, { text, width: 250, height: 250, colorDark: '#1a3a52', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
    qrCanvas = target.querySelector('canvas');
  } else {
    const img = new Image();
    img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(text);
    img.alt = 'QR code';
    img.style.maxWidth = '250px';
    target.appendChild(img);
    qrCanvas = null;   // not a canvas → download will fetch
  }
  document.getElementById('qrResult').style.display = 'block';
}
function downloadQR() {
  if (!document.getElementById('qrTarget').innerHTML) { showToast('Please generate a QR code first', 'error'); return; }
  if (qrCanvas) {
    qrCanvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'qr.png';
      a.click();
      showToast('Download started', 'success');
    });
  } else {
    const img = document.querySelector('#qrTarget img');
    if (!img) { showToast('Please generate a QR code first', 'error'); return; }
    fetch(img.src)
      .then(function (resp) { if (!resp.ok) throw new Error('Network response was not ok'); return resp.blob(); })
      .then(function (blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'qrcode.png'; a.click(); showToast('Download started', 'success'); })
      .catch(function (err) { console.error('Download QR image failed:', err); showToast('Unable to download image', 'error'); });
  }
}
function clearQR() {
  document.getElementById('qrText').value = '';
  document.getElementById('qrResult').style.display = 'none';
  document.getElementById('qrTarget').innerHTML = '';
  qrCanvas = null;
}
document.getElementById('generateBtn')?.addEventListener('click', generateQRCode);
document.getElementById('downloadQR')?.addEventListener('click', downloadQR);
document.getElementById('clearQR')?.addEventListener('click', clearQR);

// expose for manual calls
window.generateQRCode = generateQRCode;
window.downloadQR = downloadQR;
window.clearQR = clearQR;