// js/main.js
import { firebaseConfig } from './config.js';
import { loadAppData, saveAppData, setupRealtimeListener } from './db.js';
import { setupAuthListeners, logoutUser } from './auth.js';
import * as UI from './ui.js'; 
import { initMoneyInputs } from './utils.js';

// --- BRIDGE KE WINDOW (WAJIB LENGKAP) ---
const globals = [
    'navTo', 'switchTab', 'openModal', 'closeModal',
    'saveBudget', 'saveBill', 'saveLoan', 'addGoal', 'saveTargetSavings',
    'addEmergencyFund', 'saveEmergencyProfile', 'toggleEmergencySettings', 'toggleAddBill',
    'payBill', 'payLoan', 'editBudget', 'showLoanDetail', 'deletePayment', 'deleteItem',
    'renderBudget', 'renderLoans',
    'toggleFab', 'toggleTheme', 'togglePinSetup', 'pressPin', 
    'exportCSV', 'resetData', 'downloadBackup', 'restoreBackup', 
    'generatePDF', 'openLangModal', 'selectLang',
    'calculateCompound', 'toggleDcaInput', 'resetCalc', 'calcLoanPreview',
    'refreshAds'
];

// Map semua fungsi UI ke window agar bisa dipanggil dari HTML
globals.forEach(fn => {
    if(UI[fn]) window[fn] = UI[fn];
});

window.logoutUser = () => { 
    if(auth) logoutUser(auth); 
};

// --- GLOBAL VARS ---
let auth, db;

window.addEventListener('load', () => {
    if(window.firebaseLib) {
        const { initializeApp, getAuth, getFirestore, onAuthStateChanged, enableIndexedDbPersistence } = window.firebaseLib;
        
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        
        // Persistence (Offline Mode)
        enableIndexedDbPersistence(db).catch(err => console.log("Persistence:", err.code));
        
        window.dbInstance = db;
        
        // Init UI Listeners
        UI.setupConfirmListener();
        setupAuthListeners(auth);

        onAuthStateChanged(auth, (user) => {
            const loading = document.getElementById('loading-overlay');
            if(loading) loading.style.display = 'none';

            if (user) {
                window.currentUser = user;
                const loginScreen = document.getElementById('login-screen');
                if(loginScreen) loginScreen.style.display = 'none';
                startApp();
            } else {
                const loginScreen = document.getElementById('login-screen');
                if(loginScreen) loginScreen.style.display = 'flex';
            }
        });
    } else {
        alert("Fatal Error: Firebase library failed to load.");
    }
});

async function startApp() {
    await loadAppData(window.currentUser, db);
    
    setupRealtimeListener(window.currentUser, db, () => {
        UI.updateUI();
    });
    
    UI.initTheme();
    UI.checkPinLock();
    initMoneyInputs(UI.calcLoanPreview);
    UI.initBillDateSelect(); // Fitur ini dikembalikan agar dropdown tanggal tagihan muncul
    UI.updateUI();
    
    // Refresh Ads safely
    setTimeout(() => {
        if(typeof UI.refreshAds === 'function') UI.refreshAds('page-home');
    }, 1000);
}
