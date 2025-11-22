// Service Worker Gabungan Final dengan Semua Fitur PWA Builder

// Mengimpor Workbox library (versi 5.1.2)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// --- VARIABEL CACHING ---
const ASSET_CACHE_NAME = 'finpro-v1';
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
const OFFLINE_CACHE = "pwabuilder-offline-page";
const offlineFallbackPage = "index.html"; 

// --- 1. EVENT INSTALL: Pre-caching & Fallback ---
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
    event.waitUntil(
        caches.open(ASSET_CACHE_NAME).then(cache => {
            console.log('Pre-caching assets:', ASSETS);
            return cache.addAll(ASSETS);
        })
        .then(() => {
            return caches.open(OFFLINE_CACHE).then((cache) => cache.add(offlineFallbackPage));
        })
        .then(() => self.skipWaiting())
    );
});

// --- 2. EVENT ACTIVATE: Pembersihan Cache Lama & Ambil Alih ---
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating and cleaning old caches.');
    
    const cacheWhitelist = [ASSET_CACHE_NAME, OFFLINE_CACHE];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim()) 
    );
});

// --- 3. LOGIKA WORKBOX & CACHING DINAMIS ---
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: OFFLINE_CACHE 
  })
);

// --- 4. EVENT FETCH: Strategi Network-First untuk Navigasi ---
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;
        if (preloadResp) return preloadResp;

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        // Fallback ke index.html saat offline
        const cache = await caches.open(OFFLINE_CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});

// --- 5. FITUR PWA BUILDER (Sync & Push) ---

// Pemberitahuan Push
self.addEventListener('push', (event) => {
    const title = 'Pemberitahuan Push Baru!';
    const options = {
        body: event.data && event.data.text() ? event.data.text() : 'Ini adalah konten pemberitahuan.',
        icon: './images/icon-96x96.png', // Ganti dengan path icon aplikasi Anda
        badge: './images/badge.png' // Ganti dengan path badge Anda
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

// Sinkronisasi Latar Belakang (Background Sync)
self.addEventListener('sync', (event) => {
    if (event.tag === 'kirim-data-offline') { 
        console.log('Sinkronisasi Latar Belakang dipicu:', event.tag);
        event.waitUntil(
            new Promise((resolve) => {
                console.log('Mencoba mengirim data tertunda...');
                resolve(); 
            })
        );
    }
});

// Sinkronisasi Berkala (Periodic Sync)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-konten-berkala') { 
        console.log('Sinkronisasi Berkala dipicu:', event.tag);
        event.waitUntil(
            new Promise((resolve) => {
                console.log('Memperbarui konten aplikasi secara berkala...');
                resolve();
            })
        );
    }
});
