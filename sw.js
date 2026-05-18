const CACHE_NAME = 'class-routine-v1';
const FILES_TO_CACHE = [
  '/Class-Routine/',
  '/Class-Routine/index.html',
  '/Class-Routine/manifest.json',
  '/Class-Routine/icon.png'
];

// Install — cache all files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app files...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cache new requests on the fly
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }).catch(() => {
      // If both cache and network fail, serve index.html
      return caches.match('/Class-Routine/index.html');
    })
  );
});