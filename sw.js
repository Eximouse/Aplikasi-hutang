const CACHE_NAME = 'finpro-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './sw-register.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});
