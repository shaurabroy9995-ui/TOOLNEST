// image-worker.js — OffscreenCanvas worker for image resize/convert
self.addEventListener('message', async (e) => {
  const data = e.data || {};
  try {
    if (data.action === 'downscale') {
      const { file, width, height, quality = 0.9, format = 'png' } = data;
      if (!file) return self.postMessage({ ok: false, message: 'No file' });

      // Ensure we have an ArrayBuffer or Blob
      const blob = file;
      const bitmap = await createImageBitmap(blob);
      const targetW = width || bitmap.width;
      const targetH = height || bitmap.height;

      // Use OffscreenCanvas
      let canvas;
      try {
        canvas = new OffscreenCanvas(targetW, targetH);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        const outMime = (format === 'gif') ? 'image/png' : (format === 'jpeg' || format === 'jpg' ? 'image/jpeg' : (format === 'webp' ? 'image/webp' : 'image/png'));
        const blobOut = await canvas.convertToBlob({ type: outMime, quality });
        self.postMessage({ ok: true, blob: blobOut, width: targetW, height: targetH }, [blobOut]);
      } catch (err) {
        // OffscreenCanvas or convertToBlob not supported
        console.error('Worker canvas failed', err);
        self.postMessage({ ok: false, message: (err && err.message) || 'Worker processing failed' });
      }
    }
  } catch (err) {
    console.error('Worker error', err);
    self.postMessage({ ok: false, message: (err && err.message) || 'Unknown worker error' });
  }
});