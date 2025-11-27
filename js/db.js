// js/db.js
import { APP_KEY } from './config.js';
//Circular dependency? Hati-hati. 
// Sebaiknya showToast dipindah ke utils atau ui.js jangan import db.js dulu.
// Untuk amannya, kita pakai console.error dulu di sini, atau oper fungsi showToast.

// State Data Utama
export let data = {
    budget: [], loans: [], goals: [], bills: [],
    wallets: [
        { id: 1, name: 'Tunai', type: 'cash', balance: 0 },
        { id: 2, name: 'Bank/ATM', type: 'bank', balance: 0 },
        { id: 3, name: 'E-Wallet', type: 'ewallet', balance: 0 }
    ],
    emergency: { saved: 0, expense: 0, job: 'stable', dependents: '0', targetMonths: 6, targetAmount: 0 },
    settings: { theme: 'light', lang: 'id', pin: null }
};

export function setData(newData) {
    data = newData;
}

// [UPDATE] Load Data (Prioritas Cloud -> Cache Firebase -> LocalStorage)
export async function loadAppData(currentUser, db) {
    if (!currentUser || !window.firebaseLib) return; 
    const { doc, getDoc } = window.firebaseLib;

    try {
        const docRef = doc(db, "users", currentUser.uid);
        // Firebase sekarang akan otomatis cek cache dulu kalau offline
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            data = docSnap.data();
            console.log("Data loaded from Cloud/Cache");
            
            // Update LocalStorage biar sinkron untuk jaga-jaga
            localStorage.setItem(APP_KEY, JSON.stringify(data));
        } else {
            // User Baru di Cloud -> Cek HP lama
            const localData = localStorage.getItem(APP_KEY);
            if (localData) {
                data = JSON.parse(localData);
                saveAppData(currentUser, db); 
            }
        }

    } catch (error) {
        console.warn("Koneksi bermasalah, menggunakan data Offline (LocalStorage).");
        
        // [SOLUSI UTAMA] Jika Firebase Error (Offline total), Paksa ambil LocalStorage
        const localData = localStorage.getItem(APP_KEY);
        if (localData) {
            data = JSON.parse(localData);
        }
    }
    
    // Validasi Struktur Data (Wajib ada biar gak error)
    if (!data.bills) data.bills = [];
    if (!data.wallets || data.wallets.length === 0) {
         data.wallets = [{ id: 1, name: 'Tunai', type: 'cash', balance: 0 }];
    }
    if (!data.emergency) {
         data.emergency = { saved: 0, expense: 0, job: 'stable', dependents: '0', targetMonths: 6, targetAmount: 0 };
    }
} catch (error) {
        console.error("Error loading data:", error);
    }
}

// Save Data Logic
export async function saveAppData(currentUser, db) {
    // 1. Simpan Local
    localStorage.setItem(APP_KEY, JSON.stringify(data));

    // 2. Simpan Cloud
    if (currentUser && window.firebaseLib && db) {
        const { doc, setDoc } = window.firebaseLib;
        try {
            await setDoc(doc(db, "users", currentUser.uid), data);
            console.log("Synced to Cloud");
        } catch (error) {
            console.error("Cloud sync failed:", error);
        }
    }
}

// [BARU] Real-time Listener (Level 3 Feature)
export function setupRealtimeListener(currentUser, db, onUpdateCallback) {
    if (!currentUser || !window.firebaseLib) return;
    
    const { doc, onSnapshot } = window.firebaseLib;
    const docRef = doc(db, "users", currentUser.uid);

    // Fungsi onSnapshot ini akan berjalan TERUS MENERUS di background
    // Setiap ada perubahan di server (cloud), fungsi ini otomatis jalan.
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            
            // Update variabel 'data' lokal dengan data terbaru dari cloud
            // Kita gunakan Object.assign agar referensi variabel tidak putus
            Object.assign(data, cloudData);
            
            console.log("⚡ Real-time update received!");
            
            // Panggil fungsi update UI agar tampilan berubah otomatis
            if (onUpdateCallback) onUpdateCallback();
            
            // Update backup lokal juga biar sinkron
            localStorage.setItem(APP_KEY, JSON.stringify(data));
        }
    }, (error) => {
        console.error("Real-time sync error:", error);
    });

    // Kembalikan fungsi 'unsubscribe' agar bisa dimatikan saat logout
    return unsubscribe;
}
