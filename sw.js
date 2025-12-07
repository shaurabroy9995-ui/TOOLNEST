const cacheName = 'toolnest-v2';
const assetsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/main.js',
    '/tools/text-cleaner.html',
    '/tools/image-tools.html',
    '/tools/pdf-tools.html',
    '/tools/qr-generator.html',
    '/tools/base64-tools.html',
    'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
    'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assetsToCache)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
}); <script>
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
  }
</script>