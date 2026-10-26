const CACHE_NAME = 'sri-viswa-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/global.css',
  './assets/js/main.js',
  './assets/js/firebase-config.js',
  './assets/js/auth.js',
  './assets/js/admin.js',
  './assets/js/incharge.js',
  './assets/js/parent.js',
  './sections/auth/auth.css',
  './sections/admin/admin.css',
  './sections/incharge/incharge.css',
  './sections/parent/parent.css',
  './sections/shared/shared.css',
  './assets/images/logo.png',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png'
];

// Install Event: Cache all essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // POST రిక్వెస్ట్‌లను క్యాచ్ చేయవద్దు (Firebase కోసం)
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
