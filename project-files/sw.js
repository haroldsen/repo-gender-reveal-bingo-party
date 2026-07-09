const CACHE_NAME = 'gender-bingo-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/site.webmanifest',
    '/images/android-chrome-192x192.png',
    '/images/android-chrome-512x512.png'
    // Add links to your CSS, JS, or audio files here so they work offline!
];

// Install Service Worker
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Fetch Assets
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || fetch(e.request);
        })
    );
});
