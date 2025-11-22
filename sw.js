// Service Worker Gabungan: Caching Aset + Offline Fallback

// Mengimpor Workbox library (diperlukan untuk navigationPreload)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// 1. Variabel Caching Aset (Dari Screenshot Anda)
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

// 2. Variabel Offline Fallback (Dari Template PWA Builder)
const FALLBACK_CACHE = "pwabuilder-page";
const offlineFallbackPage = "index.html"; // Menggunakan index.html

// ----------------------------------------------------
// A. EVENT INSTALL: Melakukan Caching untuk Aset & Fallback
// ----------------------------------------------------
self.addEventListener('install', e => {
    // Menambahkan semua aset statis dari screenshot ke CACHE_NAME
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching assets:', ASSETS);
            return cache.addAll(ASSETS);
        })
        .then(() => {
            // Menambahkan index.html ke cache fallback
            return caches.open(FALLBACK_CACHE).then((cache) => cache.add(offlineFallbackPage));
        })
        .then(() => self.skipWaiting()) // Memastikan SW segera aktif
    );
});

// ----------------------------------------------------
// B. EVENT FETCH: Strategi Caching
// ----------------------------------------------------

// Mengaktifkan Navigation Preload jika didukung
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', e => {
    
    // --- 1. Strategi untuk PERMINTAAN NAVIGASI (Network-First dengan Offline Fallback) ---
    if (e.request.mode === 'navigate') {
        e.respondWith((async () => {
            try {
                // Coba jaringan dulu (termasuk preload)
                const preloadResp = await e.preloadResponse;
                if (preloadResp) return preloadResp;

                const networkResp = await fetch(e.request);
                return networkResp;

            } catch (error) {
                // Jika offline, sajikan index.html dari FALLBACK_CACHE
                console.log('Navigation offline, serving fallback.');
                const cache = await caches.open(FALLBACK_CACHE);
                const cachedResp = await cache.match(offlineFallbackPage);
                return cachedResp;
            }
        })());
        return; // Hentikan pemrosesan lebih lanjut
    }

    // --- 2. Strategi untuk ASET STATIS (Cache-First dengan Fallback ke Jaringan) ---
    e.respondWith(
        caches.match(e.request).then(res => {
            // Jika ada di cache (dari CACHE_NAME atau FALLBACK_CACHE), sajikan dari cache
            if (res) {
                return res;
            }

            // Jika tidak ada di cache, coba ambil dari jaringan
            return fetch(e.request).catch(() => {
                // Opsional: Anda dapat menambahkan logika fallback lain di sini
                console.warn('Network and Cache failed for:', e.request.url);
            });
        })
    );
});
