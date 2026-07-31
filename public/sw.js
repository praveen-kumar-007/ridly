const CACHE_NAME = 'ravixa-music-cache-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Let the JS memory cache handle API requests, SW handles static assets
  if (event.request.url.includes('googleapis.com')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const networkFetch = fetch(event.request).then(response => {
        // Dynamically cache new assets (JS, CSS, fonts) as they load
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
           const responseToCache = response.clone();
           caches.open(CACHE_NAME).then(cache => {
             cache.put(event.request, responseToCache);
           });
        }
        return response;
      }).catch(() => {
        // Offline fallback for React Router navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });

      // Return cached version immediately if available, otherwise wait for network
      return cachedResponse || networkFetch;
    })
  );
});
