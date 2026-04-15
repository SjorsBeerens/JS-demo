const CACHE_NAME = 'js-demo-pwa-v1';
const ASSETS = [
  'index.html',
  'shared.css',
  'demo1.html','demo1.js',
  'demo2.html','demo2.js',
  'demo3.html','demo3.js',
  'demo4.html','demo4.js',
  'demo5.html','demo5.js',
  'demo6.html','demo6.js',
  'demo7.html','demo7.js','demo7.css',
  'icon512_maskable.png','icon512_rounded.png',
  'manifest.json'
];

self.addEventListener('install', event => {
  // Cache assets individually and skip failures so install doesn't fail when a file is missing
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.all(ASSETS.map(async (url) => {
        try {
          const resp = await fetch(url, {cache: 'no-cache'});
          if (resp && resp.ok) await cache.put(url, resp.clone());
        } catch (e) {
          // skip missing/failed assets
          console.warn('SW: failed to cache', url, e);
        }
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Offline-first (cache-first) for same-origin resources: return cache if present,
  // otherwise fetch from network and cache the response for future use.
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const respClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
          }
          return response;
        }).catch(() => {
          // navigation fallback to index.html when offline
          if (event.request.mode === 'navigate' || (event.request.headers && event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('index.html');
          }
        });
      })
    );
    return;
  }

  // For cross-origin requests, try network first then cache fallback
  event.respondWith(
    fetch(event.request).then(response => response).catch(() => caches.match(event.request))
  );
});
