const cacheName = 'toolnest-v1';
const assetsToCache = [
    '/',
    '/index.html',
    '/assests/css/styles.css',
    '/main.js'
];


self.addEventListener('install', e => {
    e.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assetsToCache)));
});


self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});


