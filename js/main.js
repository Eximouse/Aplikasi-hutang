// js/main.js
import { firebaseConfig } from './config.js';
import { data, loadAppData, saveAppData } from './db.js';
import { setupAuthListeners, logoutUser } from './auth.js';
import * as UI from './ui.js'; 
import { initMoneyInputs } from './utils.js';
import { setupRealtimeListener } from './db.js'; // Import Realtime Listener

// Inisialisasi Event Listener UI
UI.setupConfirmListener();

// --- BRIDGE KE WINDOW (Agar onclick di HTML berfungsi) ---
window.navTo = UI.navTo;
window.switchTab = UI.switchTab;
window.openModal = UI.openModal;
window.closeModal = UI.closeModal;

// Fitur Simpan Data
window.saveBudget = UI.saveBudget;
window.saveBill = UI.saveBill;
window.saveLoan = UI.saveLoan;
window.addGoal = UI.addGoal;
window.addEmergencyFund = UI.addEmergencyFund;
window.saveEmergencyProfile = UI.saveEmergencyProfile;

// Fitur Aksi (Bayar, Hapus, Detail, Edit, PDF)
window.payBill = UI.payBill;
window.payLoan = UI.payLoan;
window.showLoanDetail = UI.showLoanDetail;
window.deletePayment = UI.deletePayment;
window.deleteItem = UI.deleteItem;

// [BARU DITAMBAHKAN] Jembatan untuk Pencarian & Edit & PDF
window.renderBudget = UI.renderBudget; // <-- PENTING UNTUK PENCARIAN
window.editBudget = UI.editBudget;     // <-- PENTING UNTUK EDIT
window.generatePDF = UI.generatePDF;   // <-- PENTING UNTUK PDF
// ---------------------------------------------------------

// Fitur Sistem & Tampilan
window.toggleFab = UI.toggleFab;
window.toggleTheme = UI.toggleTheme;
window.togglePinSetup = UI.togglePinSetup;
window.pressPin = UI.pressPin; 
window.resetData = UI.resetData;
window.downloadBackup = UI.downloadBackup;
window.restoreBackup = UI.restoreBackup;
window.openLangModal = UI.openLangModal;
window.selectLang = UI.selectLang;
window.logoutUser = () => {
    if (unsubscribeListener) unsubscribeListener();
    logoutUser(auth);
};

// Fungsi Kalkulator
window.calculateCompound = UI.calculateCompound; 
window.toggleDcaInput = UI.toggleDcaInput;
window.resetCalc = UI.resetCalc;
window.showCalcDetail = UI.showCalcDetail;
window.calcLoanPreview = UI.calcLoanPreview;

let auth, db;
let unsubscribeListener;

// --- LOGIKA UTAMA ---
window.addEventListener('load', () => {
    if(window.firebaseLib) {
        const { initializeApp, getAuth, getFirestore, onAuthStateChanged } = window.firebaseLib;
        
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        
        window.dbInstance = db; 

        setupAuthListeners(auth);

        onAuthStateChanged(auth, (user) => {
            const loadingOverlay = document.getElementById('loading-overlay');
            if(loadingOverlay) loadingOverlay.style.display = 'none';

            if (user) {
                window.currentUser = user;
                document.getElementById('login-screen').style.display = 'none';
                startApp();
            } else {
                document.getElementById('login-screen').style.display = 'flex';
                document.getElementById('login-status').innerText = "";
            }
        });
    } else {
        alert("FATAL: Library Firebase TIDAK DITEMUKAN!\nCek index.html Anda.");
        const loadingOverlay = document.getElementById('loading-overlay');
        if(loadingOverlay) loadingOverlay.style.display = 'none';
    }
});

async function startApp() {
    // 1. Load Data Awal
    await loadAppData(window.currentUser, db);
    
    // 2. Aktifkan Real-time Listener
    unsubscribeListener = setupRealtimeListener(window.currentUser, db, () => {
        // Refresh UI saat data berubah di cloud
        UI.renderWallets();
        UI.renderBills();
        UI.renderBudget(); // Ini akan otomatis memuat ulang list sesuai pencarian
        UI.renderLoans();
        UI.renderGoals();
        UI.renderEmergency();
        UI.updateUI();
    });
    
    // 3. Inisialisasi UI
    UI.initTheme();
    UI.checkPinLock();
    initMoneyInputs(UI.calcLoanPreview); 
    
    // 4. Render Awal
    UI.renderWallets();
    UI.renderBills();
    UI.renderBudget();
    UI.renderLoans();
    UI.renderGoals();
    UI.renderEmergency();
    UI.updateUI(); // Termasuk renderTrendChart

    // 5. Panggil Iklan
    setTimeout(() => {
        if (typeof UI.refreshAds === 'function') {
            UI.refreshAds('page-home');
        }
    }, 500);
}
