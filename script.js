// --- DICTIONARY BAHASA (Language Resources) ---
const RESOURCES = {
    id: {
        welcome_msg: "Selamat Datang di Aplikasi Finansial Pro",
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

        tab_trans: "Transaksi",
        tab_plan: "Planning & Target",
        recent_history: "Riwayat Terakhir",
        add_new_goal: "Tambah Target Baru",
        ph_goal_name: "Nama Target (misal: Beli iPhone)",
        ph_goal_amount: "Target Nominal (Rp)",
        btn_save: "Simpan",
        goal_hint: "Klik pada kartu target untuk menambah tabungan.",

        tab_active: "Aktif",
        tab_history: "Riwayat Lunas",
        ph_search_name: "Cari nama...",
        archive_paid: "Arsip Lunas",

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
        btn_choose_file: "Pilih File",
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
        
        // --- TAMBAHAN UNTUK FAB ---
        fab_trans: "Catat Transaksi",
        fab_loan: "Catat Hutang/Piutang",
        fab_emergency: "Tabung Dana Darurat",

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

        tab_trans: "Transactions",
        tab_plan: "Planning & Goals",
        recent_history: "Recent History",
        add_new_goal: "Add New Goal",
        ph_goal_name: "Goal Name (e.g., Buy iPhone)",
        ph_goal_amount: "Target Amount (Rp)",
        btn_save: "Save",
        goal_hint: "Click on a goal card to add savings.",

        tab_active: "Active",
        tab_history: "Paid History",
        ph_search_name: "Search name...",
        archive_paid: "Paid Archive",

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
        btn_choose_file: "Choose File",
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
        
        // --- TAMBAHAN UNTUK FAB ---
        fab_trans: "Record Transaction",
        fab_loan: "Record Loan",
        fab_emergency: "Add Emergency Fund",

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
    emergency: {
        saved: 0,
        expense: 0,
        job: 'stable',
        dependents: '0',
        targetMonths: 6,
        targetAmount: 0
    },
    settings: { theme: 'light', lang: 'id' }
};

// --- HELPER TRANSLATION ---
function t(key) {
    const lang = data.settings.lang || 'id';
    return RESOURCES[lang][key] || key;
}

function changeLanguage(lang) {
    data.settings.lang = lang;
    saveData();
    updateUI(); // Ini akan memicu renderLanguage
}

function renderLanguage() {
    // 1. Update text content (data-i18n)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // 2. Update placeholder input (data-i18n-ph)
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        el.placeholder = t(key);
    });

    // 3. (BARU) Update atribut data-label untuk FAB (data-i18n-label)
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
        const key = el.getAttribute('data-i18n-label');
        // Kita ubah isi atribut 'data-label' agar CSS content:attr() berubah
        el.setAttribute('data-label', t(key));
    });

    // 4. Update Dropdown Value
    document.getElementById('lang-select').value = data.settings.lang;
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initTheme();
    
    if (!data.emergency) {
        data.emergency = { saved: 0, expense: 0, job: 'stable', dependents: '0', targetMonths: 6, targetAmount: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) input.value = today;
    });

    initMoneyInputs();
    updateUI();
});

function loadData() {
    const saved = localStorage.getItem(APP_KEY);
    if (saved) data = JSON.parse(saved);
}

function saveData() {
    localStorage.setItem(APP_KEY, JSON.stringify(data));
    // updateUI dipanggil di fungsi yang memanggil saveData, atau di event change
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
    // Tanggal tidak perlu diterjemahkan hard-code, 
    // tapi kita bisa gunakan locale dari settings
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
    
    // JUDUL HEADER DINAMIS SESUAI BAHASA
    const titleKeys = {
        'page-home': 'nav_home', 
        'page-budget': 'nav_budget', 
        'page-loans': 'nav_loans', 
        'page-tools': 'nav_tools', 
        'page-settings': 'nav_settings'
    };
    
    const titleKey = titleKeys[pageId];
    // Set attribut agar bisa di-update saat ganti bahasa
    const headerEl = document.getElementById('header-title');
    headerEl.setAttribute('data-i18n', titleKey);
    headerEl.textContent = t(titleKey);
    
    const fab = document.querySelector('.fab-wrapper');
    if (pageId === 'page-settings') {
        fab.style.display = 'none';
    } else {
        fab.style.display = 'flex';
    }
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

    if (!amount || !desc) return showToast(t('msg_complete_data'), 'error');

    data.budget.unshift({ id: Date.now(), type, amount, desc, date });
    saveData();
    closeModal('modal-budget');
    resetInputs('modal-budget');
    showToast(t('msg_trans_saved'));
}

function renderBudget() {
    const list = document.getElementById('budget-list');
    list.innerHTML = '';
    let income = 0, expense = 0;

    data.budget.forEach(b => {
        if (b.type === 'income') income += b.amount; else expense += b.amount;
        
        const el = document.createElement('div');
        el.className = `list-item ${b.type}`;
        el.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <i class="fas ${b.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                <div>
                    <strong>${b.desc}</strong><br>
                    <small class="text-muted">${b.date}</small>
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

    document.getElementById('main-balance').textContent = fmtMoney(income - expense);
    document.getElementById('main-income').textContent = fmtMoney(income);
    document.getElementById('main-expense').textContent = fmtMoney(expense);
    
    renderChart(income, expense);
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
}

function addEmergencyFund() {
    const amount = parseMoney(document.getElementById('em-add-amount').value);
    if(amount > 0) {
        data.emergency.saved += amount;
        saveData();
        closeModal('modal-emergency-add');
        document.getElementById('em-add-amount').value = '';
        showToast(`${t('em_fund_title')} +${fmtMoney(amount)}`);
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
}

function renderLoans() {
    const activeList = document.getElementById('loan-list-active');
    const historyList = document.getElementById('loan-list-history');
    const search = document.getElementById('loan-search').value.toLowerCase();
    
    activeList.innerHTML = ''; historyList.innerHTML = '';
    let totPiutang = 0, totHutang = 0;

    data.loans.forEach(l => {
        if(l.status === 'active') {
            const remaining = l.total - l.paid;
            if(l.type === 'piutang') totPiutang += remaining; else totHutang += remaining;
        }

        if(!l.person.toLowerCase().includes(search)) return;

        const el = document.createElement('div');
        el.className = 'card list-item';
        el.style.borderLeft = l.type === 'piutang' ? '4px solid var(--success)' : '4px solid var(--danger)';
        
        const progress = Math.min(100, (l.paid / l.total) * 100);
        
        el.innerHTML = `
            <div style="flex:1" onclick="showLoanDetail(${l.id})">
                <div class="flex-between">
                    <strong>${l.person}</strong>
                    <span style="font-size:0.7rem; font-weight:bold; color:${l.type==='piutang'?'var(--success)':'var(--danger)'}">${l.type.toUpperCase()}</span>
                </div>
                <small class="text-muted">${fmtDate(l.date)}</small>
                <div class="flex-between mt-10 text-muted">
                    <small>${t('word_remaining')}: ${fmtMoney(l.total - l.paid)}</small>
                    <small>${Math.round(progress)}%</small>
                </div>
                <div class="goal-progress-bg" style="height:6px; margin-top:5px;">
                    <div class="goal-progress-bar" style="width:${progress}%; background:${l.type==='piutang'?'var(--success)':'var(--danger)'}"></div>
                </div>
            </div>
        `;

        if(l.status === 'active') activeList.appendChild(el);
        else historyList.appendChild(el);
    });

    document.getElementById('main-piutang').textContent = fmtMoney(totPiutang);
    document.getElementById('main-hutang').textContent = fmtMoney(totHutang);
}

function showLoanDetail(id) {
    const l = data.loans.find(x => x.id === id);
    const remaining = l.total - l.paid;
    
    let historyHtml = l.history.map(h => 
        `<div class="flex-between" style="border-bottom:1px dashed var(--border); padding:10px 0">
            <small>${fmtDate(h.date)}</small>
            <small>${fmtMoney(h.amount)}</small>
        </div>`
    ).join('');

    const html = `
        <div class="text-center mb-20">
            <h2>${l.person}</h2>
            <span class="badge-gray">${l.type.toUpperCase()}</span>
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
                <input type="text" inputmode="numeric" class="money-input" id="pay-amount" placeholder="Nominal" style="margin:0; width:60%">
                <button class="btn-primary" onclick="payLoan(${l.id})" style="width:35%">${t('word_pay')}</button>
            </div>
        </div>` : `<div class="card text-center text-green mt-20"><strong><i class="fas fa-check"></i> ${t('msg_paid')}</strong></div>`}

        <div class="mt-20">
            <h4>${t('tab_history')}</h4>
            ${historyHtml || '<small class="text-muted">-</small>'}
        </div>
        <button class="btn-danger full-width mt-20" onclick="deleteItem('loans', ${l.id})">Hapus Data</button>
    `;
    
    document.getElementById('detail-content').innerHTML = html;
    openModal('modal-detail');
    initMoneyInputs(); 
}

function payLoan(id) {
    const amount = parseMoney(document.getElementById('pay-amount').value);
    if(!amount) return;

    const l = data.loans.find(x => x.id === id);
    l.paid += amount;
    l.history.push({ date: new Date().toISOString().split('T')[0], amount });
    
    if(l.paid >= l.total) {
        l.status = 'completed';
        showToast(t('msg_paid'), 'success');
    } else {
        showToast(t('msg_payment_recorded'));
    }
    
    saveData();
    closeModal('modal-detail');
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
    
    document.getElementById('calc-result').classList.remove('hidden');
    document.getElementById('calc-total-display').textContent = fmtMoney(futureValue);
    document.getElementById('calc-principal-display').textContent = fmtMoney(totalInvested);
    document.getElementById('calc-interest-display').textContent = fmtMoney(totalInterest);

    document.getElementById('calc-principal').value = '';
    document.getElementById('calc-contribution').value = '';
    document.getElementById('calc-rate').value = '';
    document.getElementById('calc-years').value = '';
}

function resetCalc() {
    document.getElementById('calc-result').classList.add('hidden');
}

// --- SYSTEM ---
function deleteItem(collection, id) {
    if(!confirm(t('msg_confirm_del'))) return;
    data[collection] = data[collection].filter(x => x.id !== id);
    saveData();
    if(document.getElementById('modal-detail').classList.contains('active')) closeModal('modal-detail');
}

function resetData() {
    if(confirm(t('msg_confirm_reset'))) {
        localStorage.removeItem(APP_KEY);
        location.reload();
    }
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
    renderLanguage(); // RENDER BAHASA DULUAN
    renderBudget();
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

    const labels = [t('lbl_income_type'), t('lbl_expense_type')]; // Translate chart labels

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
