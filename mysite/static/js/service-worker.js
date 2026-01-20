const CACHE_NAME = 'journal-pwa-v19';
const STATIC_ASSETS = [
    '/',
    '/journal',
    '/about',
    '/projects',
    '/game', // Added the new local game route
    '/static/css/style.css',
    '/static/js/script.js',
    '/static/js/journal-app.js',
    '/static/js/storage.js',
    '/static/js/browser.js',
    '/static/js/thirdparty.js',
    '/static/js/snake.js', // Added the new snake game logic file
    '/static/images/icon-192.jpg', //  FIXED: Now matches your actual file
    '/static/images/icon-512.png'
];

// 1. INSTALL EVENT: Cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// 2. ACTIVATE EVENT: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// 3. FETCH EVENT: The "Stale-While-Revalidate" Strategy
self.addEventListener('fetch', (event) => {
    // Handle API requests (Dynamic Data)
    if (event.request.url.includes('/api/reflections')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return fetch(event.request)
                    .then((networkResponse) => {
                        // If online, clone response to cache and return it
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    })
                    .catch(() => {
                        // If offline, return cached API data
                        return cache.match(event.request);
                    });
            })
        );
        return;
    }

    // Handle Static Assets (HTML, CSS, JS)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached file if found, otherwise fetch from network
            return cachedResponse || fetch(event.request);
        })
    );
});
