// js/main.js
import { firebaseConfig } from './config.js';
import { data, loadAppData, saveAppData } from './db.js';
import { setupAuthListeners, logoutUser } from './auth.js';
import * as UI from './ui.js'; 
import { initMoneyInputs } from './utils.js';

// Inisialisasi Event Listener UI
UI.setupConfirmListener();

// --- BRIDGE KE WINDOW (Agar onclick di HTML berfungsi) ---
window.navTo = UI.navTo;
window.switchTab = UI.switchTab;
window.openModal = UI.openModal;
window.closeModal = UI.closeModal;
window.saveBudget = UI.saveBudget;
window.saveBill = UI.saveBill;
window.saveLoan = UI.saveLoan;
window.addGoal = UI.addGoal;
window.addEmergencyFund = UI.addEmergencyFund;
window.saveEmergencyProfile = UI.saveEmergencyProfile;
window.payBill = UI.payBill;
window.payLoan = UI.payLoan;
window.deleteItem = UI.deleteItem;
window.toggleFab = UI.toggleFab;
window.toggleTheme = UI.toggleTheme;
window.togglePinSetup = UI.togglePinSetup;
window.pressPin = UI.pressPin; 
window.resetData = UI.resetData;
window.downloadBackup = UI.downloadBackup;
window.restoreBackup = UI.restoreBackup;
window.openLangModal = UI.openLangModal;
window.selectLang = UI.selectLang;
window.logoutUser = () => logoutUser(auth);

// Fungsi Kalkulator (Wrapper)
window.calculateCompound = UI.calculateCompound; 
window.toggleDcaInput = UI.toggleDcaInput;
window.resetCalc = UI.resetCalc;
window.showCalcDetail = UI.showCalcDetail;

// Fungsi Kalkulator Pinjaman
window.calcLoanPreview = UI.calcLoanPreview;

let auth, db;

window.addEventListener('load', () => {
    // Cek apakah Library Firebase berhasil dimuat dari index.html?
    if(window.firebaseLib) {
        const { initializeApp, getAuth, getFirestore, onAuthStateChanged } = window.firebaseLib;
        
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        
        window.dbInstance = db; 

        setupAuthListeners(auth);

        onAuthStateChanged(auth, (user) => {
            // 1. Hilangkan Loading Overlay (karena firebase sudah selesai cek)
            const loadingOverlay = document.getElementById('loading-overlay');
            if(loadingOverlay) loadingOverlay.style.display = 'none';

            if (user) {
                // KASUS: SUDAH LOGIN
                window.currentUser = user;
                document.getElementById('login-screen').style.display = 'none';
                startApp();
            } else {
                // KASUS: BELUM LOGIN
                document.getElementById('login-screen').style.display = 'flex';
                document.getElementById('login-status').innerText = "";
            }
        });
    } else {
        // Error Handling jika Firebase Library gagal load dari HTML
        alert("FATAL: Library Firebase TIDAK DITEMUKAN!\nCek koneksi internet atau file index.html Anda.");
        const loadingOverlay = document.getElementById('loading-overlay');
        if(loadingOverlay) loadingOverlay.style.display = 'none';
    }
});

async function startApp() {
    await loadAppData(window.currentUser, db);
    
    UI.initTheme();
    UI.checkPinLock();
    initMoneyInputs(UI.calcLoanPreview); 
    
    UI.renderWallets();
    UI.renderBills();
    UI.renderBudget();
    UI.renderLoans();
    UI.renderGoals();
    UI.renderEmergency();
    UI.updateUI(); 

    setTimeout(() => {
        UI.refreshAds('page-home');
    }, 500);
}
