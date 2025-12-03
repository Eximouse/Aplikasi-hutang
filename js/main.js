import { firebaseConfig } from './config.js';
import { data, loadAppData, saveAppData, setupRealtimeListener } from './db.js';
import { setupAuthListeners, logoutUser } from './auth.js';
import { initMoneyInputs } from './utils.js';

// --- IMPORT DARI STRUKTUR UI BARU ---
import * as UI from './ui/index.js';

// Inisialisasi Event Listener UI
UI.setupConfirmListener();

// --- BRIDGE KE WINDOW ---
// [PENTING] Expose updateUI agar file anak bisa panggil tanpa circular dependency
window.updateUI = UI.updateUI;
window.renderTrendChart = UI.Budget.renderTrendChart;

// Navigasi & Modal
window.navTo = UI.Nav.navTo;
window.switchTab = UI.Nav.switchTab;
window.openModal = UI.Nav.openModal;
window.closeModal = UI.Nav.closeModal;

// Fitur Simpan Data
window.saveBudget = UI.Budget.saveBudget;
window.saveBill = UI.Bills.saveBill;
window.saveLoan = UI.Loans.saveLoan;
window.addGoal = UI.Goals.addGoal;
window.saveTargetSavings = UI.Goals.saveTargetSavings;
window.addEmergencyFund = UI.Tools.addEmergencyFund;
window.saveEmergencyProfile = UI.Tools.saveEmergencyProfile;
window.toggleEmergencySettings = UI.Tools.toggleEmergencySettings;
window.toggleAddBill = UI.Bills.toggleAddBill;

// Fitur Aksi
window.payBill = UI.Bills.payBill;
window.payLoan = UI.Loans.payLoan;
window.editBudget = UI.Budget.editBudget;
window.showLoanDetail = UI.Loans.showLoanDetail;
window.deletePayment = UI.Loans.deletePayment;
window.deleteItem = UI.deleteItem; 
window.renderBudget = UI.Budget.renderBudget;
window.renderLoans = UI.Loans.renderLoans;

// Fitur Sistem
window.toggleFab = UI.Nav.toggleFab;
window.toggleTheme = UI.Settings.toggleTheme;
window.togglePinSetup = UI.Settings.togglePinSetup;
window.pressPin = UI.Settings.pressPin; 
window.exportCSV = UI.Settings.exportCSV;
window.resetData = UI.Settings.resetData;
window.downloadBackup = UI.Settings.downloadBackup;
window.restoreBackup = UI.Settings.restoreBackup;
window.generatePDF = UI.Settings.generatePDF;
window.openLangModal = UI.Settings.openLangModal;
window.selectLang = UI.Settings.selectLang;
window.logoutUser = () => { 
    logoutUser(auth);
    if (unsubscribeListener) unsubscribeListener();
};

// Kalkulator
window.calculateCompound = UI.Tools.calculateCompound; 
window.toggleDcaInput = UI.Tools.toggleDcaInput;
window.resetCalc = UI.Tools.resetCalc;
window.showCalcDetail = UI.Tools.showCalcDetail;
window.calcLoanPreview = UI.Loans.calcLoanPreview;

// Variabel Global
let auth, db;
let unsubscribeListener;

// --- LOGIKA UTAMA SAAT APLIKASI DIMUAT ---
window.addEventListener('load', () => {
    if(window.firebaseLib) {
        const { initializeApp, getAuth, getFirestore, onAuthStateChanged, enableIndexedDbPersistence } = window.firebaseLib;
        
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
     
        enableIndexedDbPersistence(db).catch((err) => {
            console.log('Persistence:', err.code);
        });
        
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
        alert("FATAL: Library Firebase TIDAK DITEMUKAN!");
        document.getElementById('loading-overlay').style.display = 'none';
    }
});

async function startApp() {
    await loadAppData(window.currentUser, db);
    
    unsubscribeListener = setupRealtimeListener(window.currentUser, db, () => {
        UI.updateUI();
    });
    
    // Init Komponen UI
    UI.Settings.initTheme();
    UI.Settings.checkPinLock();
    initMoneyInputs(UI.Loans.calcLoanPreview); 
    
    UI.Budget.initTypeSelector();
    UI.Budget.initMonthFilter();
    UI.Budget.renderCategorySelector('expense');
    UI.Bills.initBillDateSelect();
    
    // Render Awal
    UI.updateUI(); 
}
