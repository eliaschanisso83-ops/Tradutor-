const CACHE_NAME = 'afrilingo-v3'; // Bumped to v3 for APK fix
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force new service worker to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim() // Take control of all clients immediately
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // 1. Handle Navigation Requests (HTML) - Network First, fallback to Cache, fallback to index.html (SPA)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Important: ignoreSearch: true allows index.html to be found even if URL has query params (like from Play Store)
          return caches.match('/', { ignoreSearch: true })
            .then((response) => {
              if (response) return response;
              return caches.match('/index.html', { ignoreSearch: true });
            });
        })
    );
    return;
  }

  // 2. Handle Asset Requests (JS, CSS, Images) - Cache First, fallback to Network
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache new assets dynamically (except API calls)
            const responseToCache = response.clone();
            const isApiCall = event.request.url.includes('supabase') || event.request.url.includes('generativelanguage');
            
            if (!isApiCall && event.request.method === 'GET') {
               caches.open(CACHE_NAME)
                .then((cache) => {
                   cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        );
      })
  );
});