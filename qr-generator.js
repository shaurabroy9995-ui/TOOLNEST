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


/*qr-code editor */


(function () {
    const qrText = document.getElementById("qrText");
    const qrTarget = document.getElementById("qrTarget");
    const generateBtn = document.getElementById("generateBtn");
    const downloadBtn = document.getElementById("downloadQR");
    const clearBtn = document.getElementById("clearQR");
    const qrResult = document.getElementById("qrResult");
    const qrError = document.getElementById("qrError");

    // Customizer inputs
    const qrColor = document.getElementById("qrColor");
    const qrBgColor = document.getElementById("qrBgColor");
    const qrLogoInput = document.getElementById("qrLogo");
    const qrLogoSize = document.getElementById("qrLogoSize");
    const qrErrorLevel = document.getElementById("qrErrorLevel");

    let qrInstance = null;
    let logoImage = null;

    function clearQR() {
        qrTarget.innerHTML = "";
        qrResult.style.display = "none";
        qrInstance = null;
    }

    function showError(msg) {
        if (qrError) {
            qrError.textContent = msg;
            qrError.style.color = "red";
        }
    }

    function generateQR() {
        const text = qrText.value.trim();
        if (!text) {
            showError("Please enter some content.");
            return;
        }
        if (qrError) qrError.textContent = "";

        qrTarget.innerHTML = "";

        qrInstance = new QRCode(qrTarget, {
            text: text,
            width: 280,
            height: 280,
            colorDark: qrColor?.value || "#000000",
            colorLight: qrBgColor?.value || "#ffffff",
            correctLevel: QRCode.CorrectLevel[qrErrorLevel?.value || "M"]
        });

        qrResult.style.display = "block";

        // Wait for QR to render before adding logo
        setTimeout(drawLogoSafe, 50);
    }

    function drawLogoSafe() {
        if (!logoImage) return;

        const qrCanvas = qrTarget.querySelector("canvas");
        if (!qrCanvas) return;

        const ctx = qrCanvas.getContext("2d");

        const sizePercent = Math.min(Math.max(qrLogoSize.value, 10), 30) / 100;
        const logoSize = qrCanvas.width * sizePercent;

        const x = (qrCanvas.width - logoSize) / 2;
        const y = (qrCanvas.height - logoSize) / 2;

        // White background under logo (critical for scannability)
        ctx.fillStyle = qrBgColor?.value || "#ffffff";
        ctx.fillRect(x - 8, y - 8, logoSize + 16, logoSize + 16);

        ctx.drawImage(logoImage, x, y, logoSize, logoSize);
    }

    function downloadQR() {
        const canvas = qrTarget.querySelector("canvas");
        if (!canvas) return;

        const link = document.createElement("a");
        link.download = "toolnest-qr.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    // Logo upload
    if (qrLogoInput) {
        qrLogoInput.addEventListener("change", () => {
            const file = qrLogoInput.files[0];
            if (!file) return;

            const img = new Image();
            img.onload = () => {
                logoImage = img;
                generateQR();
            };
            img.src = URL.createObjectURL(file);
        });
    }

    // Live preview hooks
    [qrColor, qrBgColor, qrLogoSize, qrErrorLevel].forEach(el => {
        if (!el) return;
        el.addEventListener("input", () => {
            if (qrInstance) generateQR();
        });
    });

    // Buttons
    generateBtn?.addEventListener("click", generateQR);
    downloadBtn?.addEventListener("click", downloadQR);
    clearBtn?.addEventListener("click", () => {
        clearQR();
        qrText.value = "";
        logoImage = null;
    });

})();





// === UX Enhancements (non-breaking) ===
(function () {
    const input = document.getElementById("qrText");
    const generateBtn = document.getElementById("generateBtn");
    const qrResult = document.getElementById("qrResult");
    const qrError = document.getElementById("qrError");

    // Clear error as user types
    input?.addEventListener("input", () => {
        if (qrError) qrError.textContent = "";
        input.classList.remove("input-error");
    });

    // Button loading feedback
    generateBtn?.addEventListener("click", () => {
        generateBtn.disabled = true;
        const oldText = generateBtn.textContent;
        generateBtn.textContent = "Generating…";

        setTimeout(() => {
            generateBtn.disabled = false;
            generateBtn.textContent = oldText;
        }, 400);
    });

    // Smooth reveal of QR
    const observer = new MutationObserver(() => {
        if (qrResult.style.display === "block") {
            qrResult.classList.add("qr-visible");
            qrResult.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });

    if (qrResult) {
        observer.observe(qrResult, { attributes: true });
    }

})();

