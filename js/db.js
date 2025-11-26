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

// Load Data Logic
export async function loadAppData(currentUser, db) {
    if (!currentUser || !window.firebaseLib) return; 
    const { doc, getDoc } = window.firebaseLib;

    try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            data = docSnap.data();
            console.log("Data loaded from Cloud");
        } else {
            const localData = localStorage.getItem(APP_KEY);
            if (localData) {
                data = JSON.parse(localData);
                saveAppData(currentUser, db); 
                console.log("Migrating Local Data...");
            }
        }
        
        // Validasi Struktur Data
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
