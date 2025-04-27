const CACHE_NAME = 'roborush-v1';

// Add a list of files to cache here
const urlsToCache = [
  '/',
  '/play',
  '/leaderboard',
  '/images/bg.png',
  '/images/robot.png',
  '/images/icon-512.png',
  '/sounds/collect.wav',
  '/sounds/hit.wav',
  '/sounds/complete.wav',
  '/sounds/bgm.mp3',
  'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js'
];

// Install service worker and cache all content
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Error caching assets:', err);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Only cache GET requests with http/https scheme
            if (
              event.request.method === 'GET' &&
              (event.request.url.startsWith('http://') || event.request.url.startsWith('https://')) &&
              !event.request.url.includes('/api/')
            ) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        );
      }).catch(() => {
        if (event.request.url.endsWith('.png') || 
            event.request.url.endsWith('.jpg') || 
            event.request.url.endsWith('.svg')) {
          return new Response('<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><text x="50" y="50" font-family="monospace" fill="#9333EA">RoboRush Offline Asset</text></svg>', 
            { headers: { 'Content-Type': 'image/svg+xml' } });
        }
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
