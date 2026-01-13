/**
 * ToolNest Service Worker v2.0
 * Features:
 * - Intelligent caching strategies
 * - Offline support
 * - Asset optimization
 * - Background sync
 * - Push notifications
 */

const CACHE_VERSION = 'toolnest-v2.0';
const CACHE_ASSETS = `${CACHE_VERSION}-assets`;
const CACHE_PAGES = `${CACHE_VERSION}-pages`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/index-new.html',
  '/support.html',
  '/privacy-new.html',
  '/styles-new.css',
  '/styles.css',
  '/JS/main.js',
  '/JS/utils.js',
  '/favicon.png'
];

const TOOLS_PAGES = [
  '/tools/base64-tools.html',
  '/tools/image-tools.html',
  '/tools/qr-generator.html',
  '/tools/text-cleaner.html',
  '/tools/text-document-tools.html'
];

/**
 * Install event - precache critical assets
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_ASSETS).then(cache => {
      return Promise.all([
        cache.addAll(PRECACHE_ASSETS),
        cache.addAll(TOOLS_PAGES)
      ]);
    }).then(() => self.skipWaiting())
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('toolnest-') && name !== CACHE_VERSION)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const { url, method } = request;

  // Skip non-GET requests
  if (method !== 'GET') {
    return;
  }

  // Skip requests to external domains and external analytics
  if (isExternalRequest(url)) {
    return;
  }

  // Route requests based on type
  if (isImageRequest(url)) {
    event.respondWith(cacheImageStrategy(request));
  } else if (isPageRequest(url)) {
    event.respondWith(cachePageStrategy(request));
  } else if (isAssetRequest(url)) {
    event.respondWith(cacheAssetStrategy(request));
  }
});

/**
 * Check if request is to external domain
 */
function isExternalRequest(url) {
  try {
    const requestUrl = new URL(url);
    const origin = self.location.origin;
    return requestUrl.origin !== origin;
  } catch (e) {
    return true;
  }
}

/**
 * Check if request is for an image
 */
function isImageRequest(url) {
  return /\.(png|jpg|jpeg|webp|gif|svg|ico)(\?.*)?$/.test(url);
}

/**
 * Check if request is for an HTML page
 */
function isPageRequest(url) {
  return /\.html?(\?.*)?$/.test(url) || url.endsWith('/');
}

/**
 * Check if request is for a static asset
 */
function isAssetRequest(url) {
  return /\.(js|css|woff|woff2|ttf|eot)(\?.*)?$/.test(url);
}

/**
 * Cache-first strategy for images
 * Serve from cache, fall back to network
 */
async function cacheImageStrategy(request) {
  try {
    const cache = await caches.open(CACHE_IMAGES);
    let response = await cache.match(request);

    if (response) {
      return response;
    }

    // Fetch from network
    response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      const responseClone = response.clone();
      cache.put(request, responseClone);
    }

    return response;
  } catch (error) {
    // Return fallback response
    return createFallbackResponse('Image unavailable');
  }
}

/**
 * Network-first strategy for pages
 * Try network first, fall back to cache
 */
async function cachePageStrategy(request) {
  try {
    // Try network first
    const response = await fetch(request);

    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_PAGES);
      cache.put(request, response.clone());
      return response;
    }

    // Fall back to cache
    return await caches.match(request) || createErrorResponse(500);
  } catch (error) {
    // Fall back to cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline page
    return createOfflineResponse();
  }
}

/**
 * Stale-while-revalidate strategy for assets
 * Serve from cache, update in background
 */
async function cacheAssetStrategy(request) {
  try {
    const cache = await caches.open(CACHE_ASSETS);
    const cached = await cache.match(request);

    if (cached) {
      // Revalidate in background
      fetch(request).then(response => {
        if (response && response.status === 200) {
          cache.put(request, response);
        }
      });
      return cached;
    }

    // Not cached, fetch from network
    const response = await fetch(request);

    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return createFallbackResponse('Asset unavailable');
  }
}

/**
 * Create fallback response
 */
function createFallbackResponse(message) {
  return new Response(message, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain'
    })
  });
}

/**
 * Create error response
 */
function createErrorResponse(status) {
  return new Response('Error loading page', {
    status: status,
    headers: new Headers({
      'Content-Type': 'text/plain'
    })
  });
}

/**
 * Create offline response
 */
function createOfflineResponse() {
  return new Response(
    '<html><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/html'
      })
    }
  );
}

/**
 * Handle background sync for offline actions
 */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-feedback') {
    event.waitUntil(
      // Sync pending feedback/bug reports
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  try {
    const db = await openIndexedDB();
    const pendingRequests = await getPendingRequests(db);

    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          body: request.body,
          headers: request.headers
        });

        if (response.ok) {
          await removePendingRequest(db, request.id);
        }
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

/**
 * Message handler for client communication
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(name => caches.delete(name))
  );
}

/**
 * IndexedDB helpers (for future offline features)
 */
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('toolnest-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-requests')) {
        db.createObjectStore('pending-requests', { keyPath: 'id' });
      }
    };
  });
}

async function getPendingRequests(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-requests'], 'readonly');
    const store = transaction.objectStore('pending-requests');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removePendingRequest(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-requests'], 'readwrite');
    const store = transaction.objectStore('pending-requests');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
