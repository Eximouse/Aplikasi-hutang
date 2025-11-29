// js/main.js
import { firebaseConfig } from './config.js';
import { data, loadAppData, saveAppData, setupRealtimeListener } from './db.js';
import { setupAuthListeners, logoutUser } from './auth.js';
import * as UI from './ui.js'; 
import { initMoneyInputs } from './utils.js';

// Inisialisasi Event Listener UI (Tombol Konfirmasi)
UI.setupConfirmListener();

// --- BRIDGE KE WINDOW (Agar onclick di HTML berfungsi) ---
// Navigasi & Modal
window.navTo = UI.navTo;
window.switchTab = UI.switchTab;
window.openModal = UI.openModal;
window.closeModal = UI.closeModal;

// Fitur Simpan Data
window.saveBudget = UI.saveBudget;
window.saveBill = UI.saveBill;
window.saveLoan = UI.saveLoan;
window.addGoal = UI.addGoal;
window.saveTargetSavings = UI.saveTargetSavings;
window.addEmergencyFund = UI.addEmergencyFund;
window.saveEmergencyProfile = UI.saveEmergencyProfile;
window.toggleEmergencySettings = UI.toggleEmergencySettings;
window.toggleAddBill = UI.toggleAddBill;

// Fitur Aksi (Bayar, Hapus, Detail)
window.payBill = UI.payBill;
window.payLoan = UI.payLoan;
window.editBudget = UI.editBudget;
window.showLoanDetail = UI.showLoanDetail;
window.deletePayment = UI.deletePayment;
window.deleteItem = UI.deleteItem;
window.renderBudget = UI.renderBudget;
window.renderLoans = UI.renderLoans;

// Fitur Sistem & Tampilan
window.toggleFab = UI.toggleFab;
window.toggleTheme = UI.toggleTheme;
window.togglePinSetup = UI.togglePinSetup;
window.pressPin = UI.pressPin; 
window.exportCSV = UI.exportCSV;
window.resetData = UI.resetData;
window.downloadBackup = UI.downloadBackup;
window.restoreBackup = UI.restoreBackup;
window.generatePDF = UI.generatePDF;
window.openLangModal = UI.openLangModal;
window.selectLang = UI.selectLang;
window.logoutUser = () => { logoutUser(auth);
if (unsubscribeListener) unsubscribeListener();
};

// Fungsi Kalkulator Investasi
window.calculateCompound = UI.calculateCompound; 
window.toggleDcaInput = UI.toggleDcaInput;
window.resetCalc = UI.resetCalc;
window.showCalcDetail = UI.showCalcDetail;

// Fungsi Kalkulator Pinjaman (Preview saat ngetik)
window.calcLoanPreview = UI.calcLoanPreview;

// Variabel Global Auth & DB
let auth, db;
let unsubscribeListener;

// --- LOGIKA UTAMA SAAT APLIKASI DIMUAT ---
window.addEventListener('load', () => {
    // Cek apakah Library Firebase berhasil dimuat dari index.html?
    if(window.firebaseLib) {
        const { initializeApp, getAuth, getFirestore, onAuthStateChanged } = window.firebaseLib;
        
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
     
       // [BARU] AKTIFKAN OFFLINE PERSISTENCE
        const { enableIndexedDbPersistence } = window.firebaseLib;
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code == 'failed-precondition') {
                console.log('Persistence failed: Multiple tabs open');
            } else if (err.code == 'unimplemented') {
                console.log('Persistence not supported by browser');
            }
        });
        
        // Simpan instance DB ke window agar bisa diakses UI.js saat save
        window.dbInstance = db; 

        // Pasang listener tombol login
        setupAuthListeners(auth);

        // Cek Status Login Pengguna
        onAuthStateChanged(auth, (user) => {
            // Matikan Loading Overlay
            const loadingOverlay = document.getElementById('loading-overlay');
            if(loadingOverlay) loadingOverlay.style.display = 'none';

            if (user) {
                // KASUS: SUDAH LOGIN
                window.currentUser = user;
                document.getElementById('login-screen').style.display = 'none';
                startApp(); // Jalankan aplikasi
            } else {
                // KASUS: BELUM LOGIN
                document.getElementById('login-screen').style.display = 'flex';
                document.getElementById('login-status').innerText = "";
            }
        });
    } else {
        // Error Handling jika Firebase Library gagal load
        alert("FATAL: Library Firebase TIDAK DITEMUKAN!\nCek koneksi internet atau file index.html Anda.");
        const loadingOverlay = document.getElementById('loading-overlay');
        if(loadingOverlay) loadingOverlay.style.display = 'none';
    }
});

// --- FUNGSI START APLIKASI ---
async function startApp() {
    // 1. Load Data Awal
    await loadAppData(window.currentUser, db);
    
    // 2. [LEVEL 3] Aktifkan Real-time Listener
    // PERBAIKAN: Hapus 'data.' di depan setupRealtimeListener
    unsubscribeListener = setupRealtimeListener(window.currentUser, db, () => {
        // Refresh SEMUA Tampilan saat data berubah
        UI.renderWallets();
        UI.renderBills();
        UI.renderBudget();
        UI.renderLoans();
        UI.renderGoals();
        UI.renderEmergency();
        UI.updateUI();
    });
    
    // 3. Inisialisasi Komponen UI
    UI.initTheme();
    UI.checkPinLock();
    initMoneyInputs(UI.calcLoanPreview); 
    if(typeof UI.initTypeSelector === 'function') UI.initTypeSelector(); 
       if (typeof UI.initBillDateSelect === 'function') UI.initBillDateSelect();
    if (typeof UI.initMonthFilter === 'function') UI.initMonthFilter();
    
    // 4. Render Awal
    UI.renderWallets();
    UI.renderBills();
    UI.renderBudget();
    UI.renderLoans();
    UI.renderGoals();
    UI.renderEmergency();
    UI.updateUI(); 

    setTimeout(() => {
        if (typeof UI.refreshAds === 'function') {
            UI.refreshAds('page-home');
        }
    }, 500);
}
