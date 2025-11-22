if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                console.log('Service Worker Registered successfully. Scope:', reg.scope);

                // --- Logika Pembaruan (Update) Service Worker ---

                // Memantau jika ada Service Worker baru yang ditemukan
                reg.addEventListener('updatefound', () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                        installingWorker.addEventListener('statechange', () => {
                            // Cek apakah Service Worker baru sudah terinstal dan ada Service Worker lama yang aktif
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('New Service Worker installed and waiting. New content available, please refresh the page.');
                                
                                // Opsi: Jika Anda ingin Service Worker baru segera aktif tanpa refresh user,
                                // Anda dapat mengirim pesan SKIP_WAITING ke Service Worker baru.
                                // installingWorker.postMessage({ type: 'SKIP_WAITING' });
                            }
                        });
                    }
                });

                // --- Akhir Logika Pembaruan ---

            })
            .catch(err => {
                console.error('Service Worker Registration Failed:', err);
            });
    });

    // Konfirmasi bahwa Service Worker telah aktif dan siap digunakan
    navigator.serviceWorker.ready.then(registration => {
        console.log('Service Worker is now ready and active.');
    });
}
