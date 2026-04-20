const CACHE_NAME = 'meetflow-v3';
const PRE_CACHE_ASSETS = [
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg'
];

// 1. Install & Pre-cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE_ASSETS))
  );
  self.skipWaiting();
});

// 2. Activate & Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((k) => k !== CACHE_NAME && caches.delete(k))
    ))
  );
});

/**
 * 3. Stale-While-Revalidate Strategy (Google Best Practice)
 * Serves from cache for instant-on, updates cache in background.
 */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.protocol !== 'http:' && requestUrl.protocol !== 'https:') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Cache only successful HTTP responses.
          if (networkResponse && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Silent catch for network failures (offline)
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
