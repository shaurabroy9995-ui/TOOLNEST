// PDFMerger.js — client-side merge & split using pdf-lib
// ADD THIS TO YOUR MERGEPDFs() FUNCTION - replace your existing merge function with this:

async function mergePDFs() {
  const files = document.getElementById('pdfFiles')?.files;
  if (!files || files.length < 2) {
    showToast('Select 2 or more PDF files', 'error');
    return;
  }

  // SHOW PROGRESS BAR
  const progressContainer = document.getElementById('mergeProgress');
  const progressFill = document.getElementById('mergeProgressFill');
  const percentage = document.getElementById('mergePercentage');
  const fileCount = document.getElementById('mergeFileCount');
  const status = document.getElementById('mergeStatus');

  progressContainer.style.display = 'block';
  fileCount.textContent = files.length;
  status.style.display = 'block';

  try {
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      // UPDATE PROGRESS
      const progress = ((i + 1) / files.length) * 100;
      progressFill.style.width = `${progress}%`;
      percentage.textContent = `${Math.round(progress)}%`;

      const arrayBuffer = await files[i].arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // COMPLETE PROGRESS
    progressFill.style.width = '100%';
    percentage.textContent = '100%';
    document.getElementById('mergeStatusText').textContent = 'Merge completed!';
    document.getElementById('mergeStatusIcon').textContent = '✅';

    const mergedPdfFile = await mergedPdf.save();
    const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });

    // DOWNLOAD
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    showToast('Merged successfully!', 'success');

  } catch (err) {
    console.error(err);
    document.getElementById('mergeStatusText').textContent = 'Merge failed';
    document.getElementById('mergeStatusIcon').textContent = '❌';
    showToast('Merge failed: ' + err.message, 'error');
  } finally {
    // HIDE PROGRESS AFTER 2 SECONDS
    setTimeout(() => {
      progressContainer.style.display = 'none';
      progressFill.style.width = '0%';
      percentage.textContent = '0%';
    }, 2000);
  }
}
async function splitPDF() {
  const file = document.getElementById('pdfFilesSplit')?.files[0];
  if (!file) { showToast('Select a PDF file to split', 'error'); return; }
  try {
    const arr = await readFileAsArrayBuffer(file);
    const pdf = await PDFLib.PDFDocument.load(arr);
    const count = pdf.getPageCount();
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const newDoc = await PDFLib.PDFDocument.create();
      const [page] = await newDoc.copyPages(pdf, [i]);
      newDoc.addPage(page);
      const bytes = await newDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const el = document.createElement('div');
      el.className = 'pdf-result';
      el.innerHTML = `<div style="display:flex;gap:0.6rem;align-items:center;margin-bottom:0.4rem;">
          <span style="font-size:0.95rem">Page ${i + 1}</span>
          <a href="${url}" download="page-${i + 1}.pdf" class="btn-primary" style="padding:0.4rem 0.6rem;border-radius:6px;text-decoration:none;color:inherit;background:var(--accent);">Download</a>
        </div>`;
      resultsList.appendChild(el);
    }
    document.getElementById('results').style.display = 'block';
    showToast('Split complete — download links ready', 'success');
  } catch (err) { console.error(err); showToast('Split failed: ' + (err.message || err), 'error'); }
}

window.mergePDFs = mergePDFs;
window.splitPDF = splitPDF;



// MAKE THE CONTAINER CLICKABLE
document.getElementById('mergeDropZone').addEventListener('click', function() {
    document.getElementById('pdfFiles').click();
});

document.getElementById('splitDropZone').addEventListener('click', function() {
    document.getElementById('pdfFilesSplit').click();
});


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