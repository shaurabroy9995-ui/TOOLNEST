const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

(async () => {
  const root = path.resolve(__dirname, '..');
  const toolsBase = `file://${path.join(root, 'tools')}`;
  console.log('Using tools base:', toolsBase);

  // Ensure fixtures exist
  const fixturesDir = path.join(root, 'fixtures');
  if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });
  const pngPath = path.join(fixturesDir, 'test.png');
  // write small 1x1 png if not present
  if (!fs.existsSync(pngPath)) {
    const buf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=', 'base64');
    fs.writeFileSync(pngPath, buf);
  }
  // create two small pdfs
  const pdf1 = path.join(fixturesDir, 'p1.pdf');
  const pdf2 = path.join(fixturesDir, 'p2.pdf');
  if (!fs.existsSync(pdf1) || !fs.existsSync(pdf2)) {
    const createSmallPdf = async (outPath, text) => {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([200, 200]);
      page.drawText(text || 'page', { x: 10, y: 180, size: 12 });
      const bytes = await pdfDoc.save();
      fs.writeFileSync(outPath, bytes);
    };
    await createSmallPdf(pdf1, 'PDF 1');
    await createSmallPdf(pdf2, 'PDF 2');
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // QR generator test
  try {
    await page.goto(`${toolsBase}/qr-generator.html`);
    await page.type('#qrText', 'https://example.com');
    await page.click('#generateBtn');
    await page.waitForSelector('#qrResult', { visible: true, timeout: 3000 });
    const hasCanvas = await page.$('#qrTarget canvas');
    const hasImg = await page.$('#qrTarget img');
    if (!hasCanvas && !hasImg) throw new Error('QR result not created');
    console.log('QR test passed');
  } catch (err) { console.error('QR test failed:', err); }

  // Image tools test
  try {
    await page.goto(`${toolsBase}/image-tools.html`);
    // upload file to first input
    const input = await page.$('#imageFile');
    await input.uploadFile(pngPath);
    // ensure preview appears
    await page.waitForSelector('#selectedPreview', { visible: true, timeout: 2000 });
    // click resize
    await page.click('button.btn-cta'); // first Resize button
    await page.waitForSelector('#imageResults', { visible: true, timeout: 4000 });
    const preview = await page.$('#imagePreview');
    if (!preview) throw new Error('Resized preview not found');
    console.log('Image resize test passed');

    // Test GIF warning
    await page.select('#imgFormat', 'gif');
    const warnVisible = await page.evaluate(() => {
      const w = document.getElementById('formatWarning');
      return w && w.style.display !== 'none';
    });
    if (!warnVisible) throw new Error('GIF warning not shown');
    console.log('GIF warning test passed');
  } catch (err) { console.error('Image tools test failed:', err); }

  // Base64 test
  try {
    await page.goto(`${toolsBase}/base64-tools.html`);
    await page.type('#base64Input', 'hello');
    await page.click('#encodeBtn');
    await page.waitForTimeout(200);
    const out = await page.$eval('#base64Output', el => el.value);
    if (out.trim() !== 'aGVsbG8=') throw new Error('Base64 output mismatch: ' + out);
    console.log('Base64 test passed');
  } catch (err) { console.error('Base64 test failed:', err); }

  // Text cleaner test
  try {
    await page.goto(`${toolsBase}/text-cleaner.html`);
    await page.type('#inputText', 'Hello   World');
    await page.click('#runCleanerBtn');
    await page.waitForTimeout(200);
    const out = await page.$eval('#outputText', el => el.value);
    if (!out.includes('Hello World')) throw new Error("Text cleaner didn't normalize spaces");
    console.log('Text cleaner test passed');
  } catch (err) { console.error('Text cleaner test failed:', err); }

  // PDF merge test (basic)
  try {
    await page.goto(`${toolsBase}/text-document-tools.html`);
    const input = await page.$('#pdfFiles');
    await input.uploadFile(pdf1, pdf2);
    await page.click('button.btn-cta');
    // wait for toast indicating merge
    await page.waitForSelector('#tn-toast-container div', { visible: true, timeout: 5000 });
    console.log('PDF merge UI test passed');
  } catch (err) { console.error('PDF merge test failed:', err); }

  await browser.close();
})();