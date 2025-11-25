// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBX0zJR2ea2mqPHnEIdcsfd8TAKGwQ7Z0o",
    authDomain: "finansial-pro.firebaseapp.com",
    projectId: "finansial-pro",
    storageBucket: "finansial-pro.firebasestorage.app",
    messagingSenderId: "762074207570",
    appId: "1:762074207570:web:908377e788bdfe11e6968b"
  };

// Variabel Global
let auth, db, currentUser;

// Menunggu Library dari HTML siap
window.addEventListener('load', () => {
    if(window.firebaseLib) {
        const { initializeApp, getAuth, getFirestore, onAuthStateChanged } = window.firebaseLib;
        
        // Mulai Firebase
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Cek apakah user sedang Login atau Belum
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // SUDAH LOGIN
                currentUser = user;
                document.getElementById('login-screen').style.display = 'none'; // Tutup layar login
                initializeAppLogic(true); // Jalankan aplikasi mode Cloud
            } else {
                // BELUM LOGIN
                document.getElementById('login-screen').style.display = 'flex'; // Munculkan layar login
                document.getElementById('login-status').innerText = "";
            }
        });
    }
});

// --- DICTIONARY BAHASA (Language Resources) ---
const RESOURCES = {
    id: {
        welcome_msg: "Selamat Datang di Aplikasi Finansial Pro",
        msg_empty_trans: "Belum ada transaksi tercatat",
        msg_empty_bill: "Belum ada tagihan rutin",
        msg_empty_goal: "Belum ada target tabungan",
        msg_empty_loan: "Belum ada data pinjaman",
        
        wallet_cash: "Tunai",
        wallet_bank: "Bank/ATM",
        wallet_ewallet: "E-Wallet",
        
        nav_home: "Beranda",
        nav_budget: "BudgetKu",
        nav_tools: "Tools",
        nav_loans: "Pinjaman",
        nav_settings: "Setelan",
        nav_calc: "Kalkulator",
        
        total_net_worth: "Total Kekayaan Bersih",
        lbl_in: "Masuk",
        lbl_out: "Keluar",
        total_receivable: "Total Piutang",
        total_debt: "Total Hutang",
        em_fund_title: "Dana Darurat",
        em_check_status: "Cek Status Aman",
        em_not_set: "Belum diset",
        cashflow_title: "Arus Kas Bulan Ini",
        
        lbl_confirm_title: "Konfirmasi",
        btn_cancel: "Batal",
        btn_yes: "Ya, Lanjutkan",
        
        tab_bills: "Tagihan",
        add_bill_title: "Tambah Tagihan Rutin",
        ph_bill_name: "Nama (cth: WiFi, Listrik)",
        lbl_due_date: "Jatuh Tempo Tanggal:",
        bill_list_title: "Tagihan Bulan Ini",
        btn_pay_bill: "Bayar Sekarang",
        msg_bill_paid: "Tagihan berhasil dibayar!",
        status_paid: "LUNAS",
        status_unpaid: "BELUM",
        status_overdue: "TELAT",
        
        tab_trans: "Transaksi",
        tab_plan: "Planning & Target",
        recent_history: "Riwayat Terakhir",
        add_new_goal: "Tambah Target Baru",
        ph_goal_name: "Nama Target (misal: Beli iPhone)",
        ph_goal_amount: "Target Nominal (Rp)",
        btn_save: "Simpan",
        goal_hint: "Klik pada kartu target untuk menambah tabungan.",
        
        lbl_interest_rate: "Bunga (%/bln)",
        lbl_tenor_month: "Tenor (Bulan)",
        lbl_installment: "Cicilan/bln",
        
        sts_due_today: "JATUH TEMPO HARI INI!",
        sts_due_in: "Jatuh Tempo: H-",
        sts_late: "TELAT",
        sts_day: "Hari",

        tab_active: "Aktif",
        tab_history: "Riwayat Lunas",
        lbl_pay_history: "Riwayat Pembayaran",
        ph_search_name: "Cari nama...",
        archive_paid: "Arsip Lunas",
        
        tip_delete_pay: "Hapus Pembayaran ini",
        confirm_del_pay: "Hapus catatan pembayaran ini? Saldo hutang akan kembali bertambah.",
        msg_pay_deleted: "Pembayaran dibatalkan/dihapus",
                
        collected: "Terkumpul",
        your_target: "Target Kamu",
        month: "Bulan",
        btn_add_savings: "Tambah Tabungan",
        risk_profile_title: "Atur Profil Risiko",
        risk_profile_desc: "Aplikasi akan menghitung target ideal berdasarkan profil risiko hidup Anda secara otomatis.",
        lbl_expense: "Pengeluaran Bulanan (Rata-rata)",
        ph_expense: "Contoh: 3.000.000",
        lbl_job_status: "Status Pekerjaan",
        opt_stable: "Karyawan Tetap / PNS (Stabil)",
        opt_freelance: "Freelance / Bisnis (Fluktuatif)",
        lbl_dependents: "Jumlah Tanggungan",
        opt_single: "Sendiri (Single)",
        opt_family_small: "1-2 Orang (Keluarga Kecil)",
        opt_family_large: "3+ Orang (Keluarga Besar)",
        btn_recalc: "Hitung Ulang Target",

        lbl_principal: "Modal Awal/Modal Saat Ini (Rp)",
        lbl_inv_method: "Pilih Metode Investasi",
        opt_lump: "Tidak Ada (Lump Sum)",
        opt_daily: "Nabung Harian",
        opt_weekly: "Nabung Mingguan",
        opt_monthly: "Nabung Bulanan",
        opt_yearly: "Nabung Tahunan",
        lbl_routine_amount: "Nominal Rutin (Rp)",
        lbl_duration: "Durasi (Thn)",
        btn_calc_sim: "Hitung Simulasi",
        est_total: "Estimasi Total Akhir:",
        lbl_capital: "Modal Disetor:",
        lbl_interest: "Bunga/Cuan:",

        pref_title: "Preferensi",
        lbl_lang: "Bahasa",
        lbl_select_lang: "Pilih Bahasa",
        btn_choose_file: "Pilih File",
        btn_download: "Simpan",
        danger_zone_title: "Hapus Data !",
        danger_zone_desc: "Data yang dihapus tidak bisa dipulihkan.",
        btn_reset_data: "Reset Semua Data",

        modal_trans_title: "Catat Keuangan",
        lbl_expense_type: "Pengeluaran",
        lbl_income_type: "Pemasukan",
        ph_desc: "Keterangan (cth: Makan Siang)",
        
        modal_loan_title: "Catat Pinjaman",
        lbl_trans_type: "Tipe Transaksi",
        opt_lend: "Saya Meminjamkan (Piutang)",
        opt_borrow: "Saya Berhutang (Hutang)",
        lbl_person_name: "Nama Orang/Pihak Kedua",
        lbl_principal_loan: "Pokok Pinjaman",
        lbl_trans_date: "Tanggal Transaksi",
        lbl_installment: "Cicilan/bln:",
        lbl_total_final: "Total Akhir:",
        
        modal_detail_title: "Rincian Transaksi",
        modal_save_title: "Tabung Dana",
        ask_amount_add: "Berapa nominal yang ingin kamu tambahkan?",
        lbl_deposit_amount: "Nominal Setor (Rp)",
        
        em_modal_desc: "Amankan masa depanmu dengan menabung hari ini.",
        em_tip: "Sisihkan uang receh atau sisa belanja harian Anda di sini agar tidak terasa berat.",
        btn_save_savings: "Simpan Tabungan",

        // Kata-kata untuk Logika JS
        word_receivable: "PIUTANG",
        word_debt: "HUTANG",
        word_remaining: "Sisa",
        ph_amount: "Nominal",
        btn_delete_data: "Hapus Data Ini",
        
        // FAB Labels
        fab_trans: "Catat Transaksi",
        fab_loan: "Catat Hutang/Piutang",
        fab_emergency: "Tabung Dana Darurat",

        // Security PIN
        security_title: "Keamanan Aplikasi",
        enable_pin: "Aktifkan PIN",
        disable_pin: "Nonaktifkan PIN",
        enter_pin: "Masukkan PIN Keamanan",
        setup_pin: "Buat PIN Baru (4 Angka)",
        pin_wrong: "PIN Salah!",
        pin_set: "PIN Keamanan Diaktifkan!",
        pin_unset: "PIN Dinonaktifkan",
        confirm_disable_pin: "Matikan keamanan PIN?",

        // JS Messages
        msg_complete_data: "Mohon lengkapi data",
        msg_trans_saved: "Transaksi berhasil dicatat",
        msg_invalid_goal: "Data target tidak valid",
        msg_goal_created: "Target baru dibuat",
        msg_invalid_amount: "Nominal tidak valid",
        msg_success_add: "Berhasil menambah",
        msg_loan_saved: "Data pinjaman tersimpan",
        msg_paid: "LUNAS",
        msg_payment_recorded: "Pembayaran dicatat",
        msg_fill_year: "Durasi tahun harus diisi",
        msg_confirm_del: "Yakin hapus item ini?",
        msg_confirm_reset: "PERINGATAN: Semua data akan hilang permanen! Lanjutkan?",
        msg_prof_saved: "Profil tersimpan! Target Anda:",
        
        word_remaining: "Sisa",
        word_bill: "Total Tagihan",
        word_pay: "Bayar"
    },
    en: {
        welcome_msg: "Welcome to Finansial Pro App",
        msg_empty_trans: "No transactions recorded yet",
        msg_empty_bill: "No recurring bills yet",
        msg_empty_goal: "No saving goals yet",
        msg_empty_loan: "No loan records yet",
        
        wallet_cash: "Cash",
        wallet_bank: "Bank/ATM",
        wallet_ewallet: "E-Wallet",
        
        nav_home: "Home",
        nav_budget: "Budget",
        nav_tools: "Tools",
        nav_loans: "Loans",
        nav_settings: "Settings",
        nav_calc: "Calculator",
        
        total_net_worth: "Total Net Worth",
        lbl_in: "Income",
        lbl_out: "Expense",
        total_receivable: "Total Receivables",
        total_debt: "Total Debt",
        em_fund_title: "Emergency Fund",
        em_check_status: "Check Status",
        em_not_set: "Not set",
        cashflow_title: "Cashflow This Month",
        
        lbl_confirm_title: "Confirmation",
        btn_cancel: "Cancel",
        btn_yes: "Yes, Proceed",
        
        tab_bills: "Bills",
        add_bill_title: "Add Recurring Bill",
        ph_bill_name: "Name (e.g. WiFi, Power)",
        lbl_due_date: "Due Date:",
        bill_list_title: "Bills This Month",
        btn_pay_bill: "Pay Now",
        msg_bill_paid: "Bill paid successfully!",
        status_paid: "PAID",
        status_unpaid: "UNPAID",
        status_overdue: "LATE",
        
        tab_trans: "Transactions",
        tab_plan: "Planning & Goals",
        recent_history: "Recent History",
        add_new_goal: "Add New Goal",
        ph_goal_name: "Goal Name (e.g., Buy iPhone)",
        ph_goal_amount: "Target Amount (Rp)",
        btn_save: "Save",
        goal_hint: "Click on a goal card to add savings.",

        lbl_interest_rate: "Interest Rate (%/mo)",
        lbl_tenor_month: "Duration (Months)",
        lbl_installment: "Installment/mo",
        
        sts_due_today: "DUE TODAY!",
        sts_due_in: "Due in: D-",
        sts_late: "OVERDUE",
        sts_day: "Days",
        
        tab_active: "Active",
        tab_history: "Paid History",
        lbl_pay_history: "Payment History",
        ph_search_name: "Search name...",
        archive_paid: "Paid Archive",                

        tip_delete_pay: "Delete this payment",
        confirm_del_pay: "Delete this payment record? Debt balance will increase.",
        msg_pay_deleted: "Payment cancelled/deleted",
        
        collected: "Collected",
        your_target: "Your Target",
        month: "Months",
        btn_add_savings: "Add Savings",
        risk_profile_title: "Risk Profile",
        risk_profile_desc: "App will calculate ideal target based on your life risk profile automatically.",
        lbl_expense: "Monthly Expense (Average)",
        ph_expense: "Ex: 3.000.000",
        lbl_job_status: "Job Status",
        opt_stable: "Permanent Employee / Gov (Stable)",
        opt_freelance: "Freelance / Business (Fluctuating)",
        lbl_dependents: "Dependents",
        opt_single: "Single (Alone)",
        opt_family_small: "1-2 People (Small Family)",
        opt_family_large: "3+ People (Large Family)",
        btn_recalc: "Recalculate Target",

        lbl_principal: "Initial Capital (Rp)",
        lbl_inv_method: "Select Invest Method",
        opt_lump: "None (Lump Sum)",
        opt_daily: "Daily Savings",
        opt_weekly: "Weekly Savings",
        opt_monthly: "Monthly Savings",
        opt_yearly: "Yearly Savings",
        lbl_routine_amount: "Routine Amount (Rp)",
        lbl_duration: "Duration (Yrs)",
        btn_calc_sim: "Calculate Simulation",
        est_total: "Estimated Total:",
        lbl_capital: "Capital Invested:",
        lbl_interest: "Interest/Profit:",

        pref_title: "Preferences",
        lbl_lang: "Language",
        lbl_select_lang: "Select Language",
        btn_choose_file: "Choose File",
        btn_download: "Download",
        danger_zone_title: "Delete Data !",
        danger_zone_desc: "Deleted data cannot be recovered.",
        btn_reset_data: "Reset All Data",

        modal_trans_title: "Record Finance",
        lbl_expense_type: "Expense",
        lbl_income_type: "Income",
        ph_desc: "Description (e.g., Lunch)",
        
        modal_loan_title: "Record Loan",
        lbl_trans_type: "Transaction Type",
        opt_lend: "I am Lending (Receivable)",
        opt_borrow: "I am Borrowing (Debt)",
        lbl_person_name: "Person Name",
        lbl_principal_loan: "Principal Loan",
        lbl_trans_date: "Transaction Date",
        lbl_installment: "Installment/mo:",
        lbl_total_final: "Final Total:",
        
        modal_detail_title: "Transaction Detail",
        modal_save_title: "Save Funds",
        ask_amount_add: "How much to add?",
        lbl_deposit_amount: "Deposit Amount (Rp)",
        
        em_modal_desc: "Secure your future by saving today.",
        em_tip: "Set aside loose change or daily shopping changes here so it doesn't feel heavy.",
        btn_save_savings: "Save Savings",
        
        // Kata-kata untuk Logika JS
        word_receivable: "LENDING", // Atau RECEIVABLE
        word_debt: "DEBT",
        word_remaining: "Remaining",
        ph_amount: "Amount",
        btn_delete_data: "Delete Data",

        // FAB Labels
        fab_trans: "Record Transaction",
        fab_loan: "Record Loan",
        fab_emergency: "Add Emergency Fund",

        // Security PIN
        security_title: "App Security",
        enable_pin: "Enable PIN",
        disable_pin: "Disable PIN",
        enter_pin: "Enter Security PIN",
        setup_pin: "Create New PIN (4 Digits)",
        pin_wrong: "Wrong PIN!",
        pin_set: "Security PIN Enabled!",
        pin_unset: "PIN Disabled",
        confirm_disable_pin: "Disable PIN security?",

        // JS Messages
        msg_complete_data: "Please complete data",
        msg_trans_saved: "Transaction saved successfully",
        msg_invalid_goal: "Invalid goal data",
        msg_goal_created: "New goal created",
        msg_invalid_amount: "Invalid amount",
        msg_success_add: "Successfully added",
        msg_loan_saved: "Loan data saved",
        msg_paid: "PAID OFF",
        msg_payment_recorded: "Payment recorded",
        msg_fill_year: "Year duration is required",
        msg_confirm_del: "Are you sure to delete this item?",
        msg_confirm_reset: "WARNING: All data will be lost permanently! Continue?",
        msg_prof_saved: "Profile saved! Your Target:",

        word_remaining: "Remaining",
        word_bill: "Total Bill",
        word_pay: "Pay"
    }
};

// --- STATE & CONFIG ---
const APP_KEY = 'finpro_elite_v1';
let data = {
    budget: [],
    loans: [],
    goals: [],
    bills: [],  
    wallets: [
        { id: 1, name: 'Tunai', type: 'cash', balance: 0 },
        { id: 2, name: 'Bank/ATM', type: 'bank', balance: 0 },
        { id: 3, name: 'E-Wallet', type: 'ewallet', balance: 0 }
    ],
    emergency: {
        saved: 0,
        expense: 0,
        job: 'stable',
        dependents: '0',
        targetMonths: 6,
        targetAmount: 0
    },
    settings: { theme: 'light', lang: 'id', pin: null }
};

// --- HELPER TRANSLATION ---
function t(key) {
    const lang = data.settings.lang || 'id';
    return RESOURCES[lang][key] || key;
}

function changeLanguage(lang) {
    data.settings.lang = lang;
    saveData();
    updateUI();
}

function renderLanguage() {
    // 1. Update Text Content (data-i18n)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // 2. Update Placeholder
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        el.placeholder = t(key);
    });

    // 3. Update Label FAB
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
        const key = el.getAttribute('data-i18n-label');
        el.setAttribute('data-label', t(key));
    });

    // [BARU] Update Label Bahasa di Halaman Settings
    const labelLang = document.getElementById('current-lang-label');
    if(labelLang) {
        labelLang.textContent = data.settings.lang === 'id' ? 'Indonesia' : 'English';
    }
    
    // Update tombol PIN juga
    updatePinButtonText();
}

    // --- SISTEM BAHASA BARU (MODAL) ---

function openLangModal() {
    // 1. Reset tampilan aktif
    document.querySelectorAll('.lang-item').forEach(el => el.classList.remove('active'));
    document.getElementById('check-id').style.display = 'none';
    document.getElementById('check-en').style.display = 'none';

    // 2. Tandai bahasa yang sedang aktif
    const cur = data.settings.lang;
    if(cur === 'id') {
        document.getElementById('check-id').parentElement.classList.add('active');
        document.getElementById('check-id').style.display = 'block';
    } else {
        document.getElementById('check-en').parentElement.classList.add('active');
        document.getElementById('check-en').style.display = 'block';
    }

    openModal('modal-lang');
}

function selectLang(langCode) {
    // 1. Simpan ke data
    data.settings.lang = langCode;
    saveData();

    // 2. Update UI (Ganti bahasa seluruh aplikasi)
    renderLanguage(); 
    
    // 3. Update konten lain
    renderWallets();
    renderBudget();
    renderBills();
    renderLoans();
    updatePinButtonText();

    // 4. Tutup modal
    closeModal('modal-lang');
    
    showToast(langCode === 'id' ? "Bahasa diganti" : "Language changed");
}

// --- INITIALIZATION ---
// [BARU] Fungsi Start Aplikasi (Dipanggil setelah Login sukses)
async function initializeAppLogic(isCloud) {
    // Jika mode cloud, kita tunggu download data dulu
    if(isCloud) await loadData(); 

    initTheme();
    checkPinLock();
    
    // Setup tanggal hari ini di input date
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) input.value = today;
    });

    initMoneyInputs();
    renderWallets();
    
    // Setup dropdown tanggal tagihan (1-31)
    const dateSelect = document.getElementById('bill-date');
    if(dateSelect && dateSelect.children.length === 0) { 
        for(let i=1; i<=31; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            dateSelect.appendChild(opt);
        }
    }
    
    renderBills();
    updateUI();
    
    // Panggil Iklan (jika ada fungsi refreshAds)
    setTimeout(() => {
        if(typeof refreshAds === "function") refreshAds('page-home');
    }, 500);
}

// [UPDATE] Load Data (Cek Cloud dulu, kalau kosong cek Local)
async function loadData() {
    if (!currentUser || !window.firebaseLib) return; 
    const { doc, getDoc } = window.firebaseLib;

    try {
        // Ambil data dari Cloud Firestore
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // KASUS 1: Data ada di Cloud -> Pakai data Cloud
            data = docSnap.data();
            console.log("Data loaded from Cloud");
        } else {
            // KASUS 2: User Baru di Cloud -> Cek HP lama
            const localData = localStorage.getItem(APP_KEY);
            if (localData) {
                // Ada data di HP -> Upload ke Cloud (Migrasi)
                data = JSON.parse(localData);
                saveData(); 
                console.log("Migrating Local Data to Cloud...");
            }
            // Kalau di HP juga kosong, berarti user benar-benar baru (pakai data default)
        }
        
        // Safety Check: Pastikan struktur data lengkap (biar gak error)
        if (!data.bills) data.bills = [];
        if (!data.wallets || data.wallets.length === 0) {
             data.wallets = [{ id: 1, name: 'Tunai', type: 'cash', balance: 0 }];
        }
        if (!data.emergency) {
             data.emergency = { saved: 0, expense: 0, job: 'stable', dependents: '0', targetMonths: 6, targetAmount: 0 };
        }

    } catch (error) {
        console.error("Error loading data:", error);
        showToast("Gagal koneksi ke server", "error");
    }
}

// [UPDATE] Save Data (Simpan ke Local DAN Cloud)
async function saveData() {
    // 1. Simpan ke HP (Backup Offline & Cache Cepat)
    localStorage.setItem(APP_KEY, JSON.stringify(data));

    // 2. Simpan ke Cloud (Jika ada internet & login)
    if (currentUser && window.firebaseLib) {
        const { doc, setDoc } = window.firebaseLib;
        try {
            await setDoc(doc(db, "users", currentUser.uid), data);
            console.log("Data synced to Cloud");
        } catch (error) {
            console.error("Gagal sync ke cloud:", error);
        }
    }
}

// --- MONEY & DATE FORMATTER HELPER ---
function initMoneyInputs() {
    const inputs = document.querySelectorAll('.money-input');
    inputs.forEach(input => {
        input.oninput = null; 
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value) {
                value = parseInt(value, 10).toLocaleString('id-ID');
                this.value = value;
            } else {
                this.value = '';
            }
            if(this.id === 'l-principal' || this.id === 'l-rate' || this.id === 'l-tenor') {
                calcLoanPreview();
            }
        });
    });
}

function parseMoney(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    return parseInt(str.replace(/\./g, ''), 10);
}

function fmtMoney(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

function fmtDate(dateString) {
    const lang = data.settings.lang === 'id' ? 'id-ID' : 'en-US';
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    let formatted = date.toLocaleDateString(lang, options);
    
    if(data.settings.lang === 'id') {
        formatted = formatted.replace(/\s/g, '-').replace('Tgl-', ''); 
    }
    return formatted;
}

// --- NAVIGATION ---
function navTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    const titleKeys = {
        'page-home': 'nav_home', 
        'page-budget': 'nav_budget', 
        'page-loans': 'nav_loans', 
        'page-tools': 'nav_tools', 
        'page-settings': 'nav_settings'
    };
    
    const titleKey = titleKeys[pageId];
    const headerEl = document.getElementById('header-title');
    headerEl.setAttribute('data-i18n', titleKey);
    headerEl.textContent = t(titleKey);
    
    const fab = document.querySelector('.fab-wrapper');
    if (pageId === 'page-settings') {
        fab.style.display = 'none';
    } else {
        fab.style.display = 'flex';
    }
    setTimeout(() => {
        refreshAds(pageId);
    }, 100);
}

function switchTab(context, tabId) {
    const parent = context === 'tools' ? document.getElementById('page-tools') : document.getElementById(`page-${context}`);
    if(!parent) return;

    const contents = parent.querySelectorAll('.tab-content');
    contents.forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none'; 
    });

    const target = document.getElementById(tabId);
    target.classList.add('active');
    target.style.display = 'block'; 
    
    const tabs = parent.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');
}

// --- UI INTERACTION ---
function toggleFab() {
    document.getElementById('fab-menu').classList.toggle('active');
    const icon = document.getElementById('fab-icon');
    icon.classList.toggle('fa-plus');
    icon.classList.toggle('fa-times');
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
    if(document.getElementById('fab-menu').classList.contains('active')) toggleFab();
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function resetInputs(containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.querySelectorAll('input').forEach(input => input.value = '');
    const today = new Date().toISOString().split('T')[0];
    const dateInput = container.querySelector('input[type="date"]');
    if(dateInput) dateInput.value = today;
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- FEATURE: BUDGET ---
function saveBudget() {
    const type = document.querySelector('input[name="b-type"]:checked').value;
    const amountRaw = document.getElementById('b-amount').value;
    const amount = parseMoney(amountRaw);
    const desc = document.getElementById('b-desc').value;
    const date = document.getElementById('b-date').value;
    // [BARU] Ambil ID dompet
    const walletId = parseInt(document.getElementById('b-wallet').value);

    if (!amount || !desc) return showToast(t('msg_complete_data'), 'error');

    // [BARU] Update Saldo Dompet
    const wallet = data.wallets.find(w => w.id === walletId);
    if (wallet) {
        if (type === 'income') {
            wallet.balance += amount;
        } else {
            wallet.balance -= amount;
        }
    }

    // [BARU] Simpan walletId ke dalam data transaksi agar bisa dibatalkan nanti
    data.budget.unshift({ id: Date.now(), type, amount, desc, date, walletId });
    
    saveData();
    closeModal('modal-budget');
    resetInputs('modal-budget');
    showToast(t('msg_trans_saved'));
    updateUI(); // Refresh semua UI
}

function renderBudget() {
    const list = document.getElementById('budget-list');
    list.innerHTML = '';
    let income = 0, expense = 0;

    data.budget.forEach(b => {
        if (b.type === 'income') income += b.amount; else expense += b.amount;
        
        // [UPDATE] Logika penamaan wallet dengan translasi bahasa (t(...))
        let walletName = 'Dompet';
        const w = data.wallets.find(x => x.id === b.walletId);
        if (w) {
            if (w.type === 'cash') walletName = t('wallet_cash');
            else if (w.type === 'bank') walletName = t('wallet_bank');
            else if (w.type === 'ewallet') walletName = t('wallet_ewallet');
            else walletName = w.name;
        }

        const el = document.createElement('div');
        el.className = `list-item ${b.type}`;
        el.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <i class="fas ${b.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                <div>
                    <strong>${b.desc}</strong> <span style="font-size:0.7em; background:var(--bg-input); padding:2px 6px; border-radius:4px; border:1px solid var(--border);">${walletName}</span><br>
                    <small class="text-muted">${fmtDate(b.date)}</small>
                </div>
            </div>
            <div style="text-align:right">
                <strong class="${b.type === 'income' ? 'text-green' : 'text-red'}">
                    ${b.type === 'income' ? '+' : '-'} ${fmtMoney(b.amount)}
                </strong>
                <br><i class="fas fa-trash text-muted" onclick="deleteItem('budget', ${b.id})" style="font-size:0.8rem; cursor:pointer; margin-top:5px;"></i>
            </div>
        `;
        list.appendChild(el);
    });
    
    document.getElementById('main-income').textContent = fmtMoney(income);
    document.getElementById('main-expense').textContent = fmtMoney(expense);
    renderChart(income, expense);
    renderEmptyState('budget-list', 'msg_empty_trans');
}

function renderWallets() {
    const container = document.getElementById('wallet-list');
    const select = document.getElementById('b-wallet');
    
    if(!container || !select) return;

    container.innerHTML = '';
    select.innerHTML = '';

    let globalTotal = 0;

    data.wallets.forEach(w => {
        globalTotal += w.balance;

        // [UPDATE] Tentukan nama berdasarkan tipe untuk translasi
        let displayName = w.name;
        if (w.type === 'cash') displayName = t('wallet_cash');
        else if (w.type === 'bank') displayName = t('wallet_bank');
        else if (w.type === 'ewallet') displayName = t('wallet_ewallet');

        // 1. Render Kartu di Home
        let iconClass = 'fa-wallet';
        if(w.type === 'bank') iconClass = 'fa-university';
        if(w.type === 'ewallet') iconClass = 'fa-mobile-alt';

        const el = document.createElement('div');
        el.className = 'wallet-card-mini';
        el.innerHTML = `
            <div class="icon"><i class="fas ${iconClass}"></i></div>
            <small>${displayName}</small>
            <strong>${fmtMoney(w.balance)}</strong>
        `;
        container.appendChild(el);

        // 2. Render Pilihan di Dropdown Modal
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `${displayName} (${fmtMoney(w.balance)})`;
        select.appendChild(opt);
    });

    // Update Total Saldo Utama
    document.getElementById('main-balance').textContent = fmtMoney(globalTotal);
}

// --- FEATURE: GOALS ---
function addGoal() {
    const name = document.getElementById('goal-name').value;
    const amount = parseMoney(document.getElementById('goal-amount').value);
    
    if(!name || !amount) return showToast(t('msg_invalid_goal'), 'error');
    
    data.goals.push({id: Date.now(), name, amount, saved: 0});
    saveData();
    
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-amount').value = '';
    showToast(t('msg_goal_created'));
    updateUI();
}

function renderGoals() {
    const container = document.getElementById('goal-list');
    container.innerHTML = '';
    
    data.goals.forEach(g => {
        const percent = Math.min(100, Math.round((g.saved / g.amount) * 100));
        
        const el = document.createElement('div');
        el.className = 'card list-item';
        el.style.display = 'block';
        el.style.cursor = 'pointer';
        
        el.onclick = (e) => {
            if(e.target.classList.contains('btn-xs') || e.target.closest('.btn-xs')) return;
            openGoalModal(g.id);
        };

        el.innerHTML = `
            <div class="flex-between">
                <strong style="font-size:1.1rem">${g.name}</strong>
                <span class="badge-gray">${percent}%</span>
            </div>
            <div class="flex-between mt-10 text-muted" style="font-size:0.9rem">
                <span>${t('collected')}: <b class="text-primary">${fmtMoney(g.saved)}</b></span>
                <span>Target: ${fmtMoney(g.amount)}</span>
            </div>
            <div class="goal-progress-bg">
                <div class="goal-progress-bar" style="width:${percent}%"></div>
            </div>
            <div class="mt-10 text-right">
                <button class="btn-xs text-red" style="border:1px solid var(--danger); background:none;" onclick="deleteItem('goals', ${g.id})">Hapus</button>
            </div>
        `;
        container.appendChild(el);
    });
   
    renderEmptyState('goal-list', 'msg_empty_goal', 'fa-bullseye');
}

function openGoalModal(id) {
    document.getElementById('target-current-id').value = id;
    document.getElementById('target-add-amount').value = '';
    openModal('modal-target-add');
}

function saveTargetSavings() {
    const id = parseInt(document.getElementById('target-current-id').value);
    const amount = parseMoney(document.getElementById('target-add-amount').value);
    
    if(!amount || amount <= 0) return showToast(t('msg_invalid_amount'), 'error');
    
    const goal = data.goals.find(g => g.id === id);
    if(goal) {
        goal.saved += amount;
        saveData();
        closeModal('modal-target-add');
        showToast(`${t('msg_success_add')} Rp ${amount.toLocaleString()}`);
    }
}

// --- FEATURE: EMERGENCY FUND ---
function toggleEmergencySettings() {
    const form = document.getElementById('emergency-settings-form');
    const icon = document.getElementById('em-settings-icon');
    form.classList.toggle('hidden');
    
    if(form.classList.contains('hidden')) {
        icon.className = 'fas fa-chevron-down';
    } else {
        icon.className = 'fas fa-chevron-up';
        document.getElementById('em-expense').value = data.emergency.expense ? data.emergency.expense.toLocaleString('id-ID') : '';
        document.getElementById('em-job').value = data.emergency.job || 'stable';
        document.getElementById('em-dependents').value = data.emergency.dependents || '0';
    }
}

function saveEmergencyProfile() {
    const expense = parseMoney(document.getElementById('em-expense').value);
    const job = document.getElementById('em-job').value;
    const dependents = document.getElementById('em-dependents').value;

    if(!expense) return showToast(t('msg_complete_data'), 'error');

    let months = 6; 
    if (job === 'freelance') months += 3;
    if (dependents === '1') months += 3; 
    else if (dependents === '3') months += 6; 

    const targetAmount = months * expense;

    data.emergency.expense = expense;
    data.emergency.job = job;
    data.emergency.dependents = dependents;
    data.emergency.targetMonths = months;
    data.emergency.targetAmount = targetAmount;

    saveData();
    toggleEmergencySettings();
    showToast(`${t('msg_prof_saved')} ${months} ${t('month')}`);
    updateUI();
}

function addEmergencyFund() {
    const amount = parseMoney(document.getElementById('em-add-amount').value);
    if(amount > 0) {
        data.emergency.saved += amount;
        saveData();
        closeModal('modal-emergency-add');
        document.getElementById('em-add-amount').value = '';
        showToast(`${t('em_fund_title')} +${fmtMoney(amount)}`);
        updateUI();
    } else {
        showToast(t('msg_invalid_amount'), 'error');
    }
}

function renderEmergency() {
    if(!data.emergency) return;
    const em = data.emergency;
    
    document.getElementById('em-target-rp').textContent = fmtMoney(em.targetAmount);
    document.getElementById('em-current-rp').textContent = fmtMoney(em.saved);
    document.getElementById('em-target-month').textContent = em.targetMonths;
    
    let percent = 0;
    if(em.targetAmount > 0) {
        percent = Math.round((em.saved / em.targetAmount) * 100);
    }
    if(percent > 100) percent = 100;

    document.getElementById('em-percent').textContent = percent + "%";
    
    const circle = document.getElementById('emergency-circle');
    circle.style.background = `conic-gradient(var(--primary) ${percent * 3.6}deg, #e0e0e0 0deg)`;
    
    const homeStatus = document.getElementById('home-emergency-status');
    if(homeStatus) {
        if(em.targetAmount === 0) homeStatus.textContent = t('em_not_set');
        else homeStatus.textContent = `${percent}% ${t('collected')}`;
    }
}

// --- FEATURE: LOANS ---
function calcLoanPreview() {
    const p = parseMoney(document.getElementById('l-principal').value) || 0;
    const r = parseFloat(document.getElementById('l-rate').value) || 0;
    const t = parseFloat(document.getElementById('l-tenor').value) || 1;

    const totalInterest = p * (r/100) * t;
    const total = p + totalInterest;
    const installment = total / t;

    document.getElementById('prev-total').textContent = fmtMoney(total);
    document.getElementById('prev-installment').textContent = fmtMoney(installment);
}

function saveLoan() {
    const type = document.getElementById('l-type').value;
    const person = document.getElementById('l-person').value;
    const principal = parseMoney(document.getElementById('l-principal').value);
    const rate = parseFloat(document.getElementById('l-rate').value) || 0;
    const tenor = parseInt(document.getElementById('l-tenor').value) || 1;
    const date = document.getElementById('l-date').value;

    if(!person || !principal) return showToast(t('msg_complete_data'), 'error');

    const total = principal + (principal * (rate/100) * tenor);
    
    data.loans.unshift({
        id: Date.now(),
        type, person, principal, rate, tenor, total, date,
        paid: 0,
        history: [],
        status: 'active'
    });
    saveData();
    closeModal('modal-loan');
    resetInputs('modal-loan');
    showToast(t('msg_loan_saved'));
    updateUI();
}

function renderLoans() {
    const activeList = document.getElementById('loan-list-active');
    const historyList = document.getElementById('loan-list-history');
    const search = document.getElementById('loan-search').value.toLowerCase();
    
    if(!activeList || !historyList) return;

    activeList.innerHTML = ''; historyList.innerHTML = '';
    let totPiutang = 0, totHutang = 0;

    const today = new Date();
    today.setHours(0,0,0,0);

    data.loans.forEach(l => {
        // Hitung Sisa untuk Header Total
        if(l.status === 'active') {
            const remaining = l.total - l.paid;
            if(l.type === 'piutang') totPiutang += remaining; else totHutang += remaining;
        }

        if(!l.person.toLowerCase().includes(search)) return;

        // --- [LOGIKA BARU: SISTEM CICILAN PINJOL] ---
        let dueStatusHTML = '';
        let progressLabel = ''; // Label misal: Cicilan 1/6
        
        if (l.status === 'active') {
            const transDate = new Date(l.date);
            transDate.setHours(0,0,0,0);

            // 1. Hitung Nominal Per Cicilan
            // (Jika tenor 0/null, dianggap 1 bulan)
            const tenor = parseInt(l.tenor) || 1;
            const installmentAmount = l.total / tenor;

            // 2. Hitung Sudah Lunas Berapa Bulan?
            // Math.floor digunakan agar kalau bayar setengah, belum dihitung lunas bulan itu
            // Ditambah sedikit buffer (100 perak) untuk toleransi koma
            let monthsPaid = Math.floor((l.paid + 100) / installmentAmount);
            
            // Batasi agar tidak melebihi tenor (jika ada kelebihan bayar sedikit)
            if (monthsPaid >= tenor) monthsPaid = tenor - 1;

            // 3. Tentukan Jatuh Tempo Berikutnya (Next Due Date)
            // Rumus: Tanggal Transaksi + (Bulan yang sudah lunas + 1)
            let nextDueDate = new Date(transDate);
            nextDueDate.setMonth(transDate.getMonth() + (monthsPaid + 1));

            // Label Cicilan (Misal: Cicilan ke-2 dari 6)
            const currentInstallmentNo = monthsPaid + 1;
            progressLabel = `Cicilan ${currentInstallmentNo}/${tenor}`;

            // 4. Hitung Selisih Hari (Jatuh Tempo Berikutnya vs Hari Ini)
            const diffTime = nextDueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            // Format Tanggal Pendek
            const lang = data.settings.lang === 'id' ? 'id-ID' : 'en-US';
            const shortDate = nextDueDate.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: '2-digit' });

            // --- RENDER STATUS ---
            if (diffDays === 0) {
                // HARI INI
                dueStatusHTML = `<small class="badge-gray" style="background:rgba(247, 183, 51, 0.15); color:var(--warning); font-weight:700; animation: pulse 1.5s infinite;">
                                    <i class="fas fa-exclamation-circle"></i> ${t('sts_due_today')}
                                 </small>`;
            } else if (diffDays > 0) {
                // BELUM JATUH TEMPO (H-xx)
                const prefix = data.settings.lang === 'id' ? 'H-' : 'Due ';
                const color = diffDays <= 7 ? 'var(--primary)' : 'var(--text-muted)';
                const bg = diffDays <= 7 ? 'rgba(68, 129, 235, 0.1)' : 'var(--bg-input)';
                
                dueStatusHTML = `<small style="background:${bg}; color:${color}; padding: 4px 10px; border-radius: 8px; font-weight:600; font-size: 0.75rem; display:inline-block;">
                                    <i class="fas fa-clock"></i> ${prefix}${diffDays} &bull; ${shortDate}
                                 </small>`;
            } else {
                // TELAT (Lewat Tanggal)
                dueStatusHTML = `<small class="badge-gray" style="background:var(--danger-bg); color:var(--danger); font-weight:700;">
                                    ${t('sts_late')} ${Math.abs(diffDays)} ${t('sts_day')}
                                 </small>`;
            }
        } else {
            // LUNAS
            dueStatusHTML = `<small class="badge-gray" style="background:var(--success-bg); color:var(--success); font-weight:700;"><i class="fas fa-check"></i> LUNAS</small>`;
            progressLabel = "Selesai";
        }
        // -------------------------------------------

        const typeLabel = l.type === 'piutang' ? t('word_receivable') : t('word_debt');
        const remainingLabel = t('word_remaining');
        const progress = Math.min(100, (l.paid / l.total) * 100);
        
        // Jika data lama tidak punya tenor, default 1 Bulan
        const displayTenor = (l.tenor || 1) + ' ' + t('month');

        const el = document.createElement('div');
        el.className = 'card list-item';
        el.style.borderLeft = l.type === 'piutang' ? '4px solid var(--success)' : '4px solid var(--danger)';
        
        el.innerHTML = `
            <div style="flex:1" onclick="showLoanDetail(${l.id})">
                <div class="flex-between">
                    <div>
                        <strong>${l.person}</strong>
                        <div style="margin-top:6px;">${dueStatusHTML}</div>
                    </div>
                    <div style="text-align:right">
                         <span style="font-size:0.7rem; font-weight:bold; color:${l.type==='piutang'?'var(--success)':'var(--danger)'}">
                            ${typeLabel} 
                        </span><br>
                        
                        <small class="text-muted" style="font-size:0.7rem; font-weight:600;">
                            ${l.status === 'active' ? progressLabel : displayTenor}
                        </small>
                    </div>
                </div>

                <div class="flex-between text-muted mt-10" style="font-size:0.85rem; border-top:1px dashed var(--border); padding-top:8px;">
                    <small>${remainingLabel}: <b style="color:var(--text-main)">${fmtMoney(l.total - l.paid)}</b></small>
                    <small>${Math.round(progress)}%</small>
                </div>
                <div class="goal-progress-bg" style="height:6px; margin-top:8px;">
                    <div class="goal-progress-bar" style="width:${progress}%; background:${l.type==='piutang'?'var(--success)':'var(--danger)'}"></div>
                </div>
            </div>
        `;

        if(l.status === 'active') activeList.appendChild(el);
        else historyList.appendChild(el);
    });

    document.getElementById('main-piutang').textContent = fmtMoney(totPiutang);
    document.getElementById('main-hutang').textContent = fmtMoney(totHutang);
    
    renderEmptyState('loan-list-active', 'msg_empty_loan', 'fa-hand-holding-usd');
    renderEmptyState('loan-list-history', 'msg_empty_loan', 'fa-history');
}

function showLoanDetail(id) {
    const l = data.loans.find(x => x.id === id);
    if (!l) return; 
    
    const remaining = l.total - l.paid;
    
    // [LOGIKA BARU] Terjemahkan tipe untuk Badge di atas
    const typeLabel = l.type === 'piutang' ? t('word_receivable') : t('word_debt');

    // History Html
    let historyHtml = l.history.map((h, i) => 
        `<div class="flex-between" style="border-bottom:1px dashed var(--border); padding:10px 0">
            <small class="text-muted">${fmtDate(h.date)}</small>
            <div style="display:flex; align-items:center; gap:10px;">
                <small style="font-weight:bold;">${fmtMoney(h.amount)}</small>
                <i class="fas fa-times-circle text-red" 
                   onclick="deletePayment(${l.id}, ${i})" 
                   style="cursor:pointer; font-size:1rem;" 
                   title="${t('tip_delete_pay')}"></i> 
            </div>
        </div>`
    ).join('');

    const html = `
        <div class="text-center mb-20">
            <h2>${l.person}</h2>
            <span class="badge-gray">${typeLabel}</span>
        </div>
        <div class="quick-stats-grid">
            <div class="stat-card text-center" style="display:block">
                <small>${t('word_bill')}</small><br><strong>${fmtMoney(l.total)}</strong>
            </div>
            <div class="stat-card text-center" style="display:block">
                <small>${t('word_remaining')}</small><br><strong class="text-red">${fmtMoney(remaining)}</strong>
            </div>
        </div>
        
        ${l.status === 'active' ? `
        <div class="card mt-20" style="background:var(--bg-body); border:none;">
            <h4><i class="fas fa-money-bill-wave"></i> ${t('word_pay')}</h4>
            <div class="flex-between mt-10">
                <input type="text" inputmode="numeric" class="money-input" id="pay-amount" placeholder="${t('ph_amount')}" style="margin:0; width:60%">
                <button class="btn-primary" onclick="payLoan(${l.id})" style="width:35%">${t('word_pay')}</button>
            </div>
        </div>` : `<div class="card text-center text-green mt-20"><strong><i class="fas fa-check"></i> ${t('msg_paid')}</strong></div>`}

        <div class="mt-20">
            <h4>${t('lbl_pay_history')}</h4>
            ${historyHtml || '<small class="text-muted" style="display:block; text-align:center; margin-top:10px;">- ' + t('word_remaining') + ' 0 -</small>'}
        </div>
        
        <button class="btn-danger full-width mt-20" onclick="deleteItem('loans', ${l.id})">${t('btn_delete_data')}</button>
    `;
    
    document.getElementById('detail-content').innerHTML = html;
    openModal('modal-detail');
    initMoneyInputs(); 
}

function payLoan(id) {
    // Ambil input dari modal detail
    const amount = parseMoney(document.getElementById('pay-amount').value);
    
    // Validasi input
    if(!amount || amount <= 0) {
        showToast(t('msg_invalid_amount'), 'error');
        return;
    }

    // Cari data loan berdasarkan ID
    const l = data.loans.find(x => x.id === id);
    if (!l) return;

    // Update data: Tambah jumlah terbayar & catat histori
    l.paid += amount;
    l.history.push({ 
        date: new Date().toISOString().split('T')[0], 
        amount: amount 
    });
    
    // Cek apakah sudah lunas
    if(l.paid >= l.total) {
        l.status = 'completed';
        showToast(t('msg_paid'), 'success');
    } else {
        showToast(t('msg_payment_recorded'));
    }
    
    saveData();
    closeModal('modal-detail');
    updateUI(); 
}

  // [UPDATE FINAL] Fungsi hapus pembayaran dengan Modal Custom
function deletePayment(loanId, historyIndex) {
    // Panggil modal custom, bukan window.confirm
    showConfirmDialog(t('confirm_del_pay'), function() {
        // --- Kode penghapusan dijalankan HANYA jika user klik tombol YES ---
        
        const l = data.loans.find(x => x.id === loanId);
        if (!l) return;

        const paymentAmount = l.history[historyIndex].amount;

        l.paid -= paymentAmount;
        if (l.paid < 0) l.paid = 0; 

        l.history.splice(historyIndex, 1);

        if (l.paid < l.total) {
            l.status = 'active';
        }

        saveData();
        updateUI(); 
        showLoanDetail(loanId); 
        
        showToast(t('msg_pay_deleted'));
    });
}


// --- FEATURE: CALCULATOR ---
function toggleDcaInput() {
    const method = document.getElementById('calc-method').value;
    const dcaGroup = document.getElementById('dca-input-group');
    if(method === 'none') {
        dcaGroup.classList.add('hidden');
    } else {
        dcaGroup.classList.remove('hidden');
    }
}

function calculateCompound() {
    const P = parseMoney(document.getElementById('calc-principal').value) || 0;
    const r = parseFloat(document.getElementById('calc-rate').value) / 100; 
    const t = parseFloat(document.getElementById('calc-years').value) || 0;
    const method = document.getElementById('calc-method').value;
    const PMT = parseMoney(document.getElementById('calc-contribution').value) || 0;

    if(t === 0) return showToast(t('msg_fill_year'), 'error');

    let n = 1; 
    if (method === 'daily') n = 365;
    else if (method === 'weekly') n = 52;
    else if (method === 'monthly') n = 12;
    else if (method === 'yearly') n = 1;

    let futureValue = 0;
    let totalContributions = 0;
    
    // Perhitungan Total Akhir
    if (method === 'none') {
        futureValue = P * Math.pow((1 + r), t);
    } else {
        const ratePerPeriod = r / n;
        const totalPeriods = n * t;
        const fvLumpSum = P * Math.pow((1 + ratePerPeriod), totalPeriods);
        const fvSeries = PMT * ((Math.pow((1 + ratePerPeriod), totalPeriods) - 1) / ratePerPeriod);
        futureValue = fvLumpSum + fvSeries;
        totalContributions = PMT * totalPeriods;
    }

    const totalInvested = P + totalContributions;
    const totalInterest = futureValue - totalInvested;
    
    // Tampilkan Hasil
    document.getElementById('calc-result').classList.remove('hidden');
    document.getElementById('calc-total-display').textContent = fmtMoney(futureValue);
    document.getElementById('calc-principal-display').textContent = fmtMoney(totalInvested);
    document.getElementById('calc-interest-display').textContent = fmtMoney(totalInterest);

    // [BARU] Tambahkan tombol "Lihat Rincian" di bawah hasil
    // Kita cek apakah tombol sudah ada, jika belum kita buat
    let btnDetail = document.getElementById('btn-calc-detail');
    if(!btnDetail) {
        const resultBox = document.querySelector('.calc-details'); 
        btnDetail = document.createElement('button');
        btnDetail.id = 'btn-calc-detail';
        btnDetail.className = 'btn-xs full-width mt-10';
        btnDetail.innerHTML = '<i class="fas fa-list-ol"></i> Lihat Progres Tahunan';
        btnDetail.onclick = showCalcDetail; // Panggil fungsi baru
        resultBox.after(btnDetail);
    }
}

function resetCalc() {
    document.getElementById('calc-result').classList.add('hidden');
}

// [BARU] Fungsi untuk menampilkan Modal Rincian Tahunan
function showCalcDetail() {
    // Ambil nilai input lagi
    const P = parseMoney(document.getElementById('calc-principal').value) || 0;
    const rRaw = parseFloat(document.getElementById('calc-rate').value) || 0;
    const r = rRaw / 100;
    const t = parseFloat(document.getElementById('calc-years').value) || 0;
    const method = document.getElementById('calc-method').value;
    const PMT = parseMoney(document.getElementById('calc-contribution').value) || 0;

    let n = 1; 
    if (method === 'daily') n = 365;
    else if (method === 'weekly') n = 52;
    else if (method === 'monthly') n = 12;
    else if (method === 'yearly') n = 1;

    const tbody = document.getElementById('calc-breakdown-list');
    tbody.innerHTML = ''; // Kosongkan tabel dulu

    // Loop per tahun
    for (let i = 1; i <= t; i++) {
        let fvYear = 0;
        let investedYear = 0;

        // Hitung FV untuk tahun ke-i
        if (method === 'none') {
            fvYear = P * Math.pow((1 + r), i);
            investedYear = P;
        } else {
            const ratePerPeriod = r / n;
            const periodsNow = n * i; // Periode sampai tahun ke-i
            
            const fvLumpSum = P * Math.pow((1 + ratePerPeriod), periodsNow);
            const fvSeries = PMT * ((Math.pow((1 + ratePerPeriod), periodsNow) - 1) / ratePerPeriod);
            
            fvYear = fvLumpSum + fvSeries;
            investedYear = P + (PMT * periodsNow);
        }

        // Render Baris Tabel
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td>${fmtMoney(investedYear)}</td>
            <td class="text-right highlight">${fmtMoney(fvYear)}</td>
        `;
        tbody.appendChild(row);
    }

    openModal('modal-calc-detail');
}

// --- SYSTEM ---
// [UPDATE FINAL] Fungsi Hapus Item Universal dengan Modal Custom
function deleteItem(collection, id) {
    // Gunakan Modal Custom
    showConfirmDialog(t('msg_confirm_del'), function() {
        
        // --- Logika Penghapusan ---
        if (collection === 'budget') {
            const item = data.budget.find(x => x.id === id);
            if (item && item.walletId) {
                const wallet = data.wallets.find(w => w.id === item.walletId);
                if (wallet) {
                    // Balikkan saldo dompet
                    if (item.type === 'income') wallet.balance -= item.amount;
                    else wallet.balance += item.amount;
                }
            }
        }

        // Hapus item dari array
        data[collection] = data[collection].filter(x => x.id !== id);
        
        saveData();
        updateUI(); 

        // Jika sedang membuka modal detail (misal di Hutang), tutup modalnya
        if(document.getElementById('modal-detail').classList.contains('active')) {
            closeModal('modal-detail');
        }
        
        showToast("Item berhasil dihapus");
    });
}

function exportCSV(type) {
    let csvContent = "data:text/csv;charset=utf-8,";
    let rows = [];
    
    if(type === 'budget') {
        rows.push("Tanggal,Tipe,Deskripsi,Nominal");
        data.budget.forEach(b => rows.push(`${b.date},${b.type},"${b.desc}",${b.amount}`));
    } else {
        rows.push("Tanggal,Tipe,Nama,Total,Terbayar,Status");
        data.loans.forEach(l => rows.push(`${l.date},${l.type},"${l.person}",${l.total},${l.paid},${l.status}`));
    }

    csvContent += rows.join("\r\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finpro_${type}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
}

function importCSV(input) {
    alert("Fitur Import CSV memerlukan pemrosesan sisi server. Saat ini hanya simulasi.");
}

function initTheme() {
    const theme = data.settings.theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-icon').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = current === 'light' ? 'dark' : 'light';
    data.settings.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    document.getElementById('theme-icon').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    saveData();
}

function updateUI() {
    renderLanguage();
    renderWallets(); 
    renderBudget();
    renderBills();
    renderLoans();
    renderGoals();
    renderEmergency();

}

let chartInstance = null;
function renderChart(income, expense) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if(chartInstance) chartInstance.destroy();
    
    if(income === 0 && expense === 0) {
        income = 1; 
        expense = 0;
    }

    const labels = [t('lbl_income_type'), t('lbl_expense_type')]; 

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#4481eb', '#fc5c7d'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            cutout: '75%',
            plugins: { 
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } 
            }
        }
    });
}

// Variable global untuk menyimpan fungsi yang akan dijalankan jika user klik YES
let onConfirmAction = null;

function showConfirmDialog(message, actionCallback) {
    // 1. Set teks pesan sesuai parameter
    document.getElementById('confirm-msg').innerText = message;
    
    // 2. Update bahasa judul & tombol
    document.getElementById('confirm-title').innerText = t('lbl_confirm_title');
    document.getElementById('btn-conf-cancel').innerText = t('btn_cancel');
    document.getElementById('btn-conf-yes-text').innerText = t('btn_yes');

    // 3. Simpan aksi yang mau dilakukan
    onConfirmAction = actionCallback;

    // 4. Buka Modal
    openModal('modal-confirm');
}

// Pasang event listener untuk tombol YES
document.getElementById('btn-conf-yes').onclick = function() {
    if (onConfirmAction) {
        onConfirmAction(); // Jalankan fungsi yang disimpan tadi
    }
    closeModal('modal-confirm'); // Tutup modal
};

// --- FITUR KEAMANAN: PIN LOCK ---
let currentPinInput = "";
let isSettingUpPin = false;

function checkPinLock() {
    const savedPin = data.settings.pin;
    const overlay = document.getElementById('pin-overlay');
    
    if (savedPin) {
        overlay.classList.remove('hidden');
        document.getElementById('pin-title').innerText = t('enter_pin');
        document.getElementById('btn-forgot-pin').style.display = 'inline-block';
        isSettingUpPin = false;
    } else {
        overlay.classList.add('hidden');
    }
}

function pressPin(key) {
    const dots = document.querySelectorAll('.dot');
    
    if (key === 'c') {
        currentPinInput = currentPinInput.slice(0, -1);
    } else if (key === 'enter') {
        // Optional logic for enter
    } else {
        if (currentPinInput.length < 4) {
            currentPinInput += key;
        }
    }

    dots.forEach((dot, index) => {
        if (index < currentPinInput.length) dot.classList.add('filled');
        else dot.classList.remove('filled');
    });

    if (currentPinInput.length === 4) {
        setTimeout(validatePin, 200);
    }
}

function validatePin() {
    const savedPin = data.settings.pin;
    const dots = document.querySelectorAll('.dot');

    if (isSettingUpPin) {
        data.settings.pin = currentPinInput;
        saveData();
        showToast(t('pin_set'), "success");
        document.getElementById('pin-overlay').classList.add('hidden');
        currentPinInput = "";
        isSettingUpPin = false;
        updatePinButtonText();
    } else {
        if (currentPinInput === savedPin) {
            document.getElementById('pin-overlay').classList.add('hidden');
            currentPinInput = "";
        } else {
            dots.forEach(d => d.classList.add('error'));
            setTimeout(() => {
                dots.forEach(d => {
                    d.classList.remove('error');
                    d.classList.remove('filled');
                });
                currentPinInput = "";
            }, 400);
            showToast(t('pin_wrong'), "error");
        }
    }
}

function togglePinSetup() {
    const overlay = document.getElementById('pin-overlay');
    currentPinInput = "";
    
    if (data.settings.pin) {
        // [UPDATE] Pakai Modal Custom untuk konfirmasi matikan PIN
        showConfirmDialog(t('confirm_disable_pin'), function() {
            data.settings.pin = null;
            saveData();
            showToast(t('pin_unset'));
            updatePinButtonText();
        });
    } else {
        isSettingUpPin = true;
        overlay.classList.remove('hidden');
        document.getElementById('pin-title').innerText = t('setup_pin');
        document.getElementById('btn-forgot-pin').style.display = 'none';
        document.querySelectorAll('.dot').forEach(d => d.classList.remove('filled'));
    }
}

function updatePinButtonText() {
    const btn = document.getElementById('btn-toggle-pin');
    if(btn) {
        // Update Teks
        btn.innerText = data.settings.pin ? t('disable_pin') : t('enable_pin');
        
        // Update Style: Hapus 'full-width', gunakan style tombol kecil (btn-xs)
        // Jika PIN aktif -> Merah (btn-toggle-inactive)
        // Jika PIN mati -> Biru (btn-toggle-active)
        if (data.settings.pin) {
            btn.className = "btn-xs btn-toggle-inactive"; 
        } else {
            btn.className = "btn-xs btn-toggle-active";
        }
    }
}

// --- BACKUP & RESTORE SYSTEM ---
function downloadBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const date = new Date().toISOString().split('T')[0];
    downloadAnchorNode.setAttribute("download", `finpro_backup_${date}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function restoreBackup(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            
            if (json.budget && json.settings) {
                // [UPDATE] Pakai Modal Custom
                const msg = data.settings.lang === 'en' 
                    ? "Current data will be replaced with backup data. Continue?" 
                    : "Data saat ini akan ditimpa dengan data backup. Lanjutkan?";

                showConfirmDialog(msg, function() {
                    data = json;
                    saveData();
                    alert("Restore Berhasil! Aplikasi akan dimuat ulang.");
                    location.reload();
                });
            } else {
                alert("File backup tidak valid!");
            }
        } catch (err) {
            alert("Error membaca file JSON!");
            console.error(err);
        }
    };
    reader.readAsText(file);
    // Reset input agar bisa pilih file yang sama lagi jika perlu
    input.value = ''; 
}

// --- FEATURE: RECURRING BILLS ---
function toggleAddBill() {
    document.getElementById('add-bill-form').classList.toggle('hidden');
}

function saveBill() {
    const name = document.getElementById('bill-name').value;
    const amount = parseMoney(document.getElementById('bill-amount').value);
    const dueDay = parseInt(document.getElementById('bill-date').value);

    if(!name || !amount) return showToast(t('msg_complete_data'), 'error');

    // lastPaidMonth format: "YYYY-MM" (contoh: "2023-11")
    data.bills.push({
        id: Date.now(),
        name,
        amount,
        dueDay,
        lastPaidMonth: null 
    });

    saveData();
    toggleAddBill();
    document.getElementById('bill-name').value = '';
    document.getElementById('bill-amount').value = '';
    showToast(t('msg_trans_saved'));
    renderBills();
    renderLanguage();
    updateUI();
}

function renderBills() {
    const list = document.getElementById('bill-list');
    if(!list) return;
    list.innerHTML = '';

    const today = new Date();
    const currentMonthStr = today.toISOString().slice(0, 7); // "YYYY-MM"
    const currentDay = today.getDate();
    
    let paidCount = 0;

    // Urutkan berdasarkan tanggal jatuh tempo
    data.bills.sort((a, b) => a.dueDay - b.dueDay);

    data.bills.forEach(bill => {
        const isPaid = bill.lastPaidMonth === currentMonthStr;
        if(isPaid) paidCount++;

        let statusHTML = '';
        let btnHTML = '';
        let borderClass = '';

        if (isPaid) {
            statusHTML = `<span class="badge-gray" style="background:var(--success-bg); color:var(--success);"><i class="fas fa-check"></i> ${t('status_paid')}</span>`;
            borderClass = 'border-left-green'; // Styling CSS tambahan nanti
        } else {
            // Cek Telat
            if (currentDay > bill.dueDay) {
                statusHTML = `<span class="badge-gray" style="background:var(--danger-bg); color:var(--danger);">${t('status_overdue')}</span>`;
                borderClass = 'border-left-red'; // Styling CSS tambahan nanti
            } else {
                statusHTML = `<span class="badge-gray">${t('status_unpaid')}</span>`;
            }
            
            // Tombol Bayar
            btnHTML = `<button class="btn-xs text-primary" onclick="payBill(${bill.id})" style="margin-top:8px;">${t('btn_pay_bill')}</button>`;
        }

        const el = document.createElement('div');
        el.className = `card list-item ${borderClass}`;
        el.style.display = 'block'; 
        el.innerHTML = `
            <div class="flex-between">
                <div>
                    <strong>${bill.name}</strong>
                    <div style="font-size:0.8rem; margin-top:4px;" class="text-muted">
                        ${t('lbl_due_date')} <b>${bill.dueDay}</b>
                    </div>
                </div>
                <div style="text-align:right">
                    <strong>${fmtMoney(bill.amount)}</strong><br>
                    ${statusHTML}
                </div>
            </div>
            <div class="flex-between" style="align-items:flex-end">
                 <i class="fas fa-trash text-muted" onclick="deleteItem('bills', ${bill.id})" style="font-size:0.8rem; cursor:pointer; margin-top:15px;"></i>
                 ${btnHTML}
            </div>
        `;
        list.appendChild(el);
    });

    document.getElementById('bill-status-summary').textContent = `${paidCount}/${data.bills.length} ${t('status_paid')}`;
    renderEmptyState('bill-list', 'msg_empty_bill', 'fa-file-invoice');
    
}

function payBill(id) {
    // 1. Cari data tagihan
    const bill = data.bills.find(b => b.id === id);
    if(!bill) return;

    // 2. Tanya user mau pakai dompet mana (Simple prompt dulu atau default dompet utama)
    // Untuk simplifikasi UX PWA, kita anggap pakai dompet pertama yang punya saldo cukup, 
    // atau user harus manual catat pengeluaran? 
    // LEBIH BAIK: Kita catat otomatis sebagai Transaksi Pengeluaran.
    
    // Kita cek wallet mana yang paling banyak isinya (Auto-select) atau default ID 1
    // Agar simple, kita masukkan ke wallet ID 1 (Cash) atau ID 2 (Bank) 
    // (Ide pengembangan: Munculkan modal pilih dompet. Tapi biar cepat, kita pakai Wallet Bank/ATM sebagai default bayar tagihan).
    const defaultWalletId = 2; // Asumsi bayar tagihan via Transfer/Bank
    
    const wallet = data.wallets.find(w => w.id === defaultWalletId);
    if(wallet) {
        wallet.balance -= bill.amount;
    }

    // 3. Catat di history transaksi (Budget)
    const todayStr = new Date().toISOString().split('T')[0];
    data.budget.unshift({
        id: Date.now(),
        type: 'expense',
        amount: bill.amount,
        desc: `[Tagihan] ${bill.name}`,
        date: todayStr,
        walletId: defaultWalletId
    });

    // 4. Update status tagihan jadi Lunas bulan ini
    bill.lastPaidMonth = new Date().toISOString().slice(0, 7);

    saveData();
    showToast(t('msg_bill_paid'));
    updateUI(); // Refresh semua (saldo berkurang, tagihan jadi hijau, history nambah)
}

// Fungsi Reset Data (Versi Modal Custom)
function resetData() {
    showConfirmDialog(t('msg_confirm_reset'), function() {
        localStorage.removeItem(APP_KEY);
        location.reload();
    });
}

// [BARU] Fungsi Helper untuk menampilkan status kosong
function renderEmptyState(containerId, messageKey, iconClass = 'fa-clipboard-list') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Cek apakah wadah kosong (tidak punya anak elemen)
    if (container.children.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 20px; opacity:0.6; animation: fadeIn 0.5s;">
                <i class="fas ${iconClass}" style="font-size:3rem; margin-bottom:15px; color:var(--text-muted);"></i>
                <p class="text-muted" style="font-size:0.95rem;">${t(messageKey)}</p>
            </div>
        `;
    }
}

// [BARU] Fungsi Smart-Load Iklan (Dengan Pengecekan Lebar & Retry)
function refreshAds(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Cari semua slot iklan di dalam halaman ini
    const ads = container.querySelectorAll('ins.adsbygoogle');
    
    ads.forEach(ad => {
        // 1. Cek apakah iklan SUDAH pernah dimuat? (Biar tidak double)
        if (ad.getAttribute('data-adsbygoogle-status')) return;

        // 2. [PENTING] Cek apakah slot iklan sudah punya lebar (Sudah Tampil)?
        // Jika offsetWidth === 0, berarti masih hidden/loading. Kita tunda.
        if (ad.offsetWidth === 0) {
            // Coba panggil fungsi ini lagi setelah 300ms (0.3 detik)
            setTimeout(() => {
                refreshAds(containerId);
            }, 300);
            return; // Stop proses kali ini
        }

        // 3. Jika sudah punya lebar, baru kita Request ke Google
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            // Error handling diam-diam agar tidak mengganggu user
            console.log("AdSense pending layout...");
        }
    });
}

 // [UPDATE] Tambahkan try-catch lebih aman
        try {
            // Cek apakah adsbygoogle sudah siap
            if (typeof window.adsbygoogle !== 'undefined') {
                window.adsbygoogle.push({});
            }
        } catch (e) {
            // Sembunyikan error AdSense agar tidak memenuhi console saat testing
            console.warn("AdSense belum siap (Abaikan jika di Emulator)");
        }
  
// --- AUTHENTICATION HANDLERS ---

// Tombol Login Google
const btnLogin = document.getElementById('btn-google-login');
if(btnLogin) {
    btnLogin.addEventListener('click', () => {
        if(!window.firebaseLib) return;
        const { signInWithPopup, GoogleAuthProvider } = window.firebaseLib;
        const provider = new GoogleAuthProvider();
        
        document.getElementById('login-status').innerText = "Menghubungkan ke Google...";
        
        signInWithPopup(auth, provider)
            .then((result) => {
                showToast("Login Berhasil!");
                // Tidak perlu reload, onAuthStateChanged di atas akan otomatis jalan
            }).catch((error) => {
                document.getElementById('login-status').innerText = "Gagal: " + error.message;
            });
    });
}

// Tombol Logout
function logoutUser() {
    showConfirmDialog("Keluar dari akun? Data di HP ini tetap ada, tapi sinkronisasi berhenti.", function() {
        if(!window.firebaseLib) return;
        const { signOut } = window.firebaseLib;
        
        signOut(auth).then(() => {
            location.reload(); // Refresh halaman agar kembali ke layar login
        });
    });
}
        