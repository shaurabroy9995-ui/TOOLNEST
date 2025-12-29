# ToolNest QA & Smoke Tests

## Quick smoke test (automated)

Run the lightweight smoke checks to ensure all tool pages include required elements:

- Install dependencies (if needed): `npm install`
- Run: `npm run smoke`

The script will return non-zero on failures and print missing elements.

## Browser UI tests (Puppeteer)

A small Puppeteer harness is included to validate basic UI flows (QR generation, image resize/preview, base64, text cleaner, PDF merge UI). To run:

- Install dev dependencies: `npm install --include=dev`
- Run: `npm run test:browser`

Note: Puppeteer will download a Chromium build on first install and may take longer on first run.

## Manual QA checklist (recommended)

1. Base64 Tools
   - Enter text, click **Encode**, verify output updates.
   - Click **Copy**, then paste into another app to verify clipboard.
   - Click **Decode** with a valid base64 string and verify restore.

2. Text Cleaner
   - Paste messy text and toggle cleaning options, click **Clean Text**.
   - Verify stats (characters, words, lines) update.
   - Use **Copy** and **Download** to verify outputs and file creation.

3. Image Tools
   - Select an image in **Resize** — preview and file name appear above input.
   - Change width/height (or only one) and **Resize Image** to see result.
   - Use **Quality** slider and test **Convert Format** (PNG, JPEG, WebP). GIF falls back to PNG and shows a warning.
   - Verify **Download Image** saves expected format and name.

4. QR Generator
   - Enter text/URL and click **Generate QR Code**.
   - Verify preview appears and **Download** saves an image.

5. PDF Tools
   - Select multiple PDFs and click **Merge PDFs**, verify merged download.
   - Select a single PDF and click **Split PDF**, verify per-page downloads appear.

## Notes & Known limitations

- GIF export from canvas falls back to PNG — GIF is not reliably created client-side via canvas.
- Large images or very big PDFs may hit browser memory limits; for heavy usage, consider a worker or server-side processing.

## Development notes

- Main scripts live under `JS/TOOLS-JS/` and pages are in `tools/`.
- A lightweight toast system (`showToast`) and processing overlay are available via `window.Toolnest.ui`.
- The smoke test script is `scripts/smoke-tests.js` and can be extended with additional checks.

If you want, I can add a small test harness (Puppeteer) to automatically open pages and take screenshots for CI.
