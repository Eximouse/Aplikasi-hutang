// js/ui.js
import { data, saveAppData } from './db.js';
import { t, fmtMoney, fmtDate, parseMoney, initMoneyInputs } from './utils.js';
import { APP_KEY } from './config.js';

// --- VARIABLES ---
let chartInstance = null;
let trendChartInstance = null;
let currentPinInput = "";
let isSettingUpPin = false;
let onConfirmAction = null;

// --- HELPER UI ---
export function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- NAVIGATION & MODALS ---
export function navTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
    
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
    headerEl.textContent = t(titleKey, data.settings.lang);
    
    const fab = document.querySelector('.fab-wrapper');
    if (pageId === 'page-settings') {
        fab.style.display = 'none';
    } else {
        fab.style.display = 'flex';
    }
    // Trigger lazy load ads saat pindah halaman
    setTimeout(() => {
        if (typeof window.refreshAds === 'function') window.refreshAds(pageId);
        // Render ulang grafik trend jika masuk home agar animasi jalan
        if (pageId === 'page-home') renderTrendChart();
    }, 100);
}

export function switchTab(context, tabId) {
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

export function toggleFab() {
    document.getElementById('fab-menu').classList.toggle('active');
    const icon = document.getElementById('fab-icon');
    icon.classList.toggle('fa-plus');
    icon.classList.toggle('fa-times');
}

export function openModal(id) {
    document.getElementById(id).classList.add('active');
    if(document.getElementById('fab-menu').classList.contains('active')) toggleFab();
}

export function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    resetInputs(id); // Reset form saat ditutup
}

function resetInputs(containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    // 1. Kosongkan semua input teks
    container.querySelectorAll('input:not([type="radio"]):not([type="hidden"])').forEach(input => input.value = '');
    
    // 2. Reset Tanggal ke Hari Ini
    const today = new Date().toISOString().split('T')[0];
    const dateInput = container.querySelector('input[type="date"]');
    if(dateInput) dateInput.value = today;

    // 3. [FIX] Reset Radio Button ke "Pengeluaran" (Default)
    if(containerId === 'modal-budget') {
        const defaultRadio = document.getElementById('t-out');
        if(defaultRadio) defaultRadio.checked = true;
        document.getElementById('b-id').value = ''; // Hapus ID Edit
    }
}

function renderEmptyState(containerId, messageKey, iconClass = 'fa-clipboard-list') {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (container.children.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 20px; opacity:0.6; animation: fadeIn 0.5s;">
                <i class="fas ${iconClass}" style="font-size:3rem; margin-bottom:15px; color:var(--text-muted);"></i>
                <p class="text-muted" style="font-size:0.95rem;">${t(messageKey, data.settings.lang)}</p>
            </div>
        `;
    }
}

// --- FEATURE: WALLETS ---
export function renderWallets() {
    const container = document.getElementById('wallet-list');
    const select = document.getElementById('b-wallet');
    if(!container || !select) return;

    container.innerHTML = '';
    select.innerHTML = '';
    let globalTotal = 0;

    data.wallets.forEach(w => {
        globalTotal += w.balance;
        let displayName = w.name;
        if (w.type === 'cash') displayName = t('wallet_cash', data.settings.lang);
        else if (w.type === 'bank') displayName = t('wallet_bank', data.settings.lang);
        else if (w.type === 'ewallet') displayName = t('wallet_ewallet', data.settings.lang);

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

        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `${displayName} (${fmtMoney(w.balance)})`;
        select.appendChild(opt);
    });
    document.getElementById('main-balance').textContent = fmtMoney(globalTotal);
}

//[BARU] Mengisi dropdown bulan secara otomatis
export function initMonthFilter() {
    const select = document.getElementById('filter-month');
    if(!select) return;

    select.innerHTML = '<option value="all">Semua Waktu</option>';

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const today = new Date();
    
    // Tampilkan 12 bulan ke belakang + bulan depan
    for (let i = -1; i < 12; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        
        // [PERBAIKAN] Ambil Tahun & Bulan Lokal secara manual
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Tambah 0 di depan jika 1 digit (misal: 1 -> 01)
        const value = `${year}-${month}`; // Hasil: "2025-11"
        
        const label = `${monthNames[d.getMonth()]} ${year}`;
        
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        
        if (i === 0) opt.selected = true;
        select.appendChild(opt);
    }
}

// --- FEATURE: BUDGET (TRANSAKSI) ---
export function renderBudget() {
    const list = document.getElementById('budget-list');
    const searchInput = document.getElementById('budget-search');
    const filterMonth = document.getElementById('filter-month').value; // [BARU] Ambil bulan
    const sortOrder = document.getElementById('filter-sort-budget').value; // [BARU] Ambil urutan
    
    const keyword = searchInput ? searchInput.value.toLowerCase() : "";

    if(!list) return;
    list.innerHTML = '';
    
    let income = 0, expense = 0;

    // 1. Copy data agar aslinya tidak teracak
    let displayedData = [...data.budget];

    // 2. Filter Search & Bulan
    displayedData = displayedData.filter(b => {
        const matchesKeyword = b.desc.toLowerCase().includes(keyword);
        const matchesMonth = filterMonth === 'all' || b.date.startsWith(filterMonth);
        return matchesKeyword && matchesMonth;
    });

    // 3. Sorting (Terbaru/Terlama)
    displayedData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    displayedData.forEach(b => {
        if (b.type === 'income') income += b.amount; else expense += b.amount;
        
        let walletName = 'Dompet';
        const w = data.wallets.find(x => x.id === b.walletId);
        if (w) {
            if (w.type === 'cash') walletName = t('wallet_cash', data.settings.lang);
            else if (w.type === 'bank') walletName = t('wallet_bank', data.settings.lang);
            else if (w.type === 'ewallet') walletName = t('wallet_ewallet', data.settings.lang);
            else walletName = w.name;
        }

        const el = document.createElement('div');
        el.className = `card list-item ${b.type}`;
        
        el.innerHTML = `
            <div>
                <i class="fas ${b.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                <div>
                    <strong>${b.desc}</strong><br>
                    <small class="text-muted">${fmtDate(b.date, data.settings.lang)} &bull; ${walletName}</small>
                </div>
            </div>
            <div class="text-right">
                <strong class="${b.type === 'income' ? 'text-green' : 'text-red'}">
                    ${b.type === 'income' ? '+' : '-'} ${fmtMoney(b.amount)}
                </strong>
                <div style="margin-top:5px; display:flex; gap:10px; justify-content:flex-end;">
                    <i class="fas fa-pen text-primary" onclick="editBudget(${b.id})" style="font-size:0.9rem; cursor:pointer;"></i>
                    <i class="fas fa-trash text-muted" onclick="deleteItem('budget', ${b.id})" style="font-size:0.9rem; cursor:pointer;"></i>
                </div>
            </div>
        `;
        list.appendChild(el);
    });
    
    document.getElementById('main-income').textContent = fmtMoney(income);
    document.getElementById('main-expense').textContent = fmtMoney(expense);
    
    // Update Grafik Donat (Opsional: agar grafik mengikuti filter)
    if (typeof renderChart === "function") {
        renderChart(income, expense);
    }

    if(displayedData.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;"><i class="fas fa-search" style="font-size:2rem; margin-bottom:10px;"></i><p>Tidak ditemukan</p></div>`;
    }
}

// Fungsi Gambar Chart Donat (Dipisah)
export function renderChart(income, expense) {
    const ctx = document.getElementById('mainChart');
    if(!ctx) return;

    if(chartInstance) chartInstance.destroy();
    
    if(income === 0 && expense === 0) { income = 1; expense = 0; }
    const labels = [t('lbl_income_type', data.settings.lang), t('lbl_expense_type', data.settings.lang)]; 

    chartInstance = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#2563eb', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            cutout: '75%',
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
        }
    });
}

// Fungsi Simpan Budget (Baru & Edit)
export function saveBudget() {
    const id = document.getElementById('b-id').value; 
    const typeRadio = document.querySelector('input[name="b-type"]:checked');
    const type = typeRadio ? typeRadio.value : 'expense'; // [FIX] Ambil nilai radio dgn aman

    const amountRaw = document.getElementById('b-amount').value;
    const amount = parseMoney(amountRaw);
    const desc = document.getElementById('b-desc').value;
    const date = document.getElementById('b-date').value;
    const walletId = parseInt(document.getElementById('b-wallet').value);

    if (!amount || !desc) return showToast(t('msg_complete_data', data.settings.lang), 'error');

    // --- LOGIKA EDIT ---
    if (id) {
        const oldItem = data.budget.find(b => b.id == id);
        if (oldItem) {
            // 1. Kembalikan saldo lama
            const oldWallet = data.wallets.find(w => w.id === oldItem.walletId);
            if (oldWallet) {
                if (oldItem.type === 'income') oldWallet.balance -= oldItem.amount;
                else oldWallet.balance += oldItem.amount;
            }
            // 2. Update Item
            oldItem.type = type;
            oldItem.amount = amount;
            oldItem.desc = desc;
            oldItem.date = date;
            oldItem.walletId = walletId;
            
            // 3. Potong saldo baru
            const newWallet = data.wallets.find(w => w.id === walletId);
            if (newWallet) {
                if (type === 'income') newWallet.balance += amount;
                else newWallet.balance -= amount;
            }
            showToast("Transaksi berhasil diedit");
        }
    } 
    // --- LOGIKA BARU ---
    else {
        const wallet = data.wallets.find(w => w.id === walletId);
        if (wallet) {
            if (type === 'income') wallet.balance += amount;
            else wallet.balance -= amount;
        }
        data.budget.unshift({ id: Date.now(), type, amount, desc, date, walletId });
        showToast(t('msg_trans_saved', data.settings.lang));
    }
    
    saveAppData(window.currentUser, window.dbInstance);
    closeModal('modal-budget');
    updateUI(); 
}

// Fungsi Buka Modal Edit
export function editBudget(id) {
    const item = data.budget.find(b => b.id === id);
    if (!item) return;

    document.getElementById('b-id').value = item.id;
    document.getElementById('b-amount').value = item.amount.toLocaleString('id-ID');
    document.getElementById('b-desc').value = item.desc;
    document.getElementById('b-date').value = item.date;
    
    if(item.walletId) document.getElementById('b-wallet').value = item.walletId;
    
    // [FIX] Set Radio Button dengan benar
    if (item.type === 'income') {
        document.getElementById('t-in').checked = true;
    } else {
        document.getElementById('t-out').checked = true;
    }

    openModal('modal-budget');
}

// --- FEATURE: BILLS ---
export function renderBills() {
    const list = document.getElementById('bill-list');
    if(!list) return;
    list.innerHTML = '';

    const today = new Date();
    const currentMonthStr = today.toISOString().slice(0, 7); 
    const currentDay = today.getDate();
    let paidCount = 0;

    data.bills.sort((a, b) => a.dueDay - b.dueDay);

    data.bills.forEach(bill => {
        const isPaid = bill.lastPaidMonth === currentMonthStr;
        if(isPaid) paidCount++;

        let statusHTML = '';
        let btnHTML = '';
        let borderClass = '';

        // [UPDATE] Hapus background, sisakan warna teks saja
        if (isPaid) {
            statusHTML = `<span class="badge-gray" style="color:var(--success);"><i class="fas fa-check"></i> ${t('status_paid', data.settings.lang)}</span>`;
            borderClass = 'border-left-green';
        } else {
            if (currentDay > bill.dueDay) {
                statusHTML = `<span class="badge-gray" style="color:var(--danger);">${t('status_overdue', data.settings.lang)}</span>`;
                borderClass = 'border-left-red';
            } else {
                statusHTML = `<span class="badge-gray" style="color:var(--text-muted);">${t('status_unpaid', data.settings.lang)}</span>`;
            }
            btnHTML = `<button class="btn-xs text-primary" onclick="payBill(${bill.id})" style="margin-top:8px; border:1px solid var(--primary);">${t('btn_pay_bill', data.settings.lang)}</button>`;
        }

        const el = document.createElement('div');
        el.className = `card list-item ${borderClass}`;
        
        el.innerHTML = `
            <div class="flex-between">
                <div>
                    <strong>${bill.name}</strong>
                    <div style="font-size:0.8rem; margin-top:4px;" class="text-muted">
                        ${t('lbl_due_date', data.settings.lang)} <b>${bill.dueDay}</b>
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

    document.getElementById('bill-status-summary').textContent = `${paidCount}/${data.bills.length} ${t('status_paid', data.settings.lang)}`;
       
    renderEmptyState('bill-list', 'msg_empty_bill', 'fa-file-invoice');
}

export function saveBill() {
    const name = document.getElementById('bill-name').value;
    const amount = parseMoney(document.getElementById('bill-amount').value);
    const dueDay = parseInt(document.getElementById('bill-date').value);

    if(!name || !amount) return showToast(t('msg_complete_data', data.settings.lang), 'error');

    data.bills.push({ id: Date.now(), name, amount, dueDay, lastPaidMonth: null });

    saveAppData(window.currentUser, window.dbInstance);
    document.getElementById('add-bill-form').classList.add('hidden');
    document.getElementById('bill-name').value = '';
    document.getElementById('bill-amount').value = '';
    showToast(t('msg_trans_saved', data.settings.lang));
    renderBills();
    updateUI();
}

export function payBill(id) {
    const bill = data.bills.find(b => b.id === id);
    if(!bill) return;

    const defaultWalletId = 2; 
    const wallet = data.wallets.find(w => w.id === defaultWalletId);
    if(wallet) wallet.balance -= bill.amount;

    const todayStr = new Date().toISOString().split('T')[0];
    data.budget.unshift({
        id: Date.now(),
        type: 'expense',
        amount: bill.amount,
        desc: `[Tagihan] ${bill.name}`,
        date: todayStr,
        walletId: defaultWalletId
    });

    bill.lastPaidMonth = new Date().toISOString().slice(0, 7);

    saveAppData(window.currentUser, window.dbInstance);
    showToast(t('msg_bill_paid', data.settings.lang));
    updateUI();
}

// --- FEATURE: GOALS ---
export function addGoal() {
    const name = document.getElementById('goal-name').value;
    const amount = parseMoney(document.getElementById('goal-amount').value);
    
    if(!name || !amount) return showToast(t('msg_invalid_goal', data.settings.lang), 'error');
    
    data.goals.push({id: Date.now(), name, amount, saved: 0});
    saveAppData(window.currentUser, window.dbInstance);
    
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-amount').value = '';
    showToast(t('msg_goal_created', data.settings.lang));
    updateUI();
}

export function renderGoals() {
    const container = document.getElementById('goal-list');
    container.innerHTML = '';
    
    data.goals.forEach(g => {
        const percent = Math.min(100, Math.round((g.saved / g.amount) * 100));
        
        const el = document.createElement('div');
        el.className = 'card list-item';
        el.onclick = (e) => {
            if(e.target.classList.contains('btn-xs') || e.target.closest('.btn-xs')) return;
            openGoalModal(g.id);
        };

        el.innerHTML = `
            <div style="width:100%">
                <div class="flex-between">
                    <strong>${g.name}</strong>
                    <span class="badge-gray">${percent}%</span>
                </div>
                <div class="flex-between mt-10 text-muted" style="font-size:0.8rem">
                    <span>${t('collected', data.settings.lang)}: <b class="text-primary">${fmtMoney(g.saved)}</b></span>
                    <span>Target: ${fmtMoney(g.amount)}</span>
                </div>
                <div class="goal-progress-bg">
                    <div class="goal-progress-bar" style="width:${percent}%"></div>
                </div>
                <div class="text-right mt-10">
                    <button class="btn-xs" style="border-color:var(--danger); color:var(--danger);" onclick="deleteItem('goals', ${g.id})">Hapus</button>
                </div>
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

export function saveTargetSavings() {
    const id = parseInt(document.getElementById('target-current-id').value);
    const amount = parseMoney(document.getElementById('target-add-amount').value);
    
    if(!amount || amount <= 0) return showToast(t('msg_invalid_amount', data.settings.lang), 'error');
    
    const goal = data.goals.find(g => g.id === id);
    if(goal) {
        goal.saved += amount;
        saveAppData(window.currentUser, window.dbInstance);
        closeModal('modal-target-add');
        showToast(`${t('msg_success_add', data.settings.lang)} Rp ${amount.toLocaleString()}`);
        updateUI();
    }
}

// --- FEATURE: LOANS (Sistem Cicilan) ---
export function calcLoanPreview() {
    const p = parseMoney(document.getElementById('l-principal').value) || 0;
    const r = parseFloat(document.getElementById('l-rate').value) || 0;
    const t = parseFloat(document.getElementById('l-tenor').value) || 1;

    const totalInterest = p * (r/100) * t;
    const total = p + totalInterest;
    const installment = total / t;

    document.getElementById('prev-total').textContent = fmtMoney(total);
    document.getElementById('prev-installment').textContent = fmtMoney(installment);
}

export function saveLoan() {
    const type = document.getElementById('l-type').value;
    const person = document.getElementById('l-person').value;
    const principal = parseMoney(document.getElementById('l-principal').value);
    const rate = parseFloat(document.getElementById('l-rate').value) || 0;
    const tenor = parseInt(document.getElementById('l-tenor').value) || 1;
    const date = document.getElementById('l-date').value;

    if(!person || !principal) return showToast(t('msg_complete_data', data.settings.lang), 'error');

    const total = principal + (principal * (rate/100) * tenor);
    
    data.loans.unshift({
        id: Date.now(), type, person, principal, rate, tenor, total, date,
        paid: 0, history: [], status: 'active'
    });
    saveAppData(window.currentUser, window.dbInstance);
    closeModal('modal-loan');
    resetInputs('modal-loan');
    showToast(t('msg_loan_saved', data.settings.lang));
    updateUI();
}

export function renderLoans() {
    const activeList = document.getElementById('loan-list-active');
    const historyList = document.getElementById('loan-list-history');
    const search = document.getElementById('loan-search').value.toLowerCase();
    const sortOrder = document.getElementById('filter-sort-loan').value;
    
    if(!activeList || !historyList) return;
    activeList.innerHTML = ''; historyList.innerHTML = '';
    let totPiutang = 0, totHutang = 0;
    const today = new Date(); today.setHours(0,0,0,0);

     // 1. Siapkan data dengan kalkulasi hari jatuh tempo (nextDueDate)
    let processedLoans = data.loans.map(l => {
        let diffDays = 9999; // Default jauh
        let nextDueDateObj = null;

        if (l.status === 'active') {
            const remaining = l.total - l.paid;
            if(l.type === 'piutang') totPiutang += remaining; else totHutang += remaining;

            // Hitung Next Due Date
            const transDate = new Date(l.date); transDate.setHours(0,0,0,0);
            const tenor = parseInt(l.tenor) || 1;
            const installmentAmount = l.total / tenor;
            let monthsPaid = Math.floor((l.paid + 100) / installmentAmount); // +100 toleransi pembulatan
            if (monthsPaid >= tenor) monthsPaid = tenor - 1;

            let nextDueDate = new Date(transDate);
            nextDueDate.setMonth(transDate.getMonth() + (monthsPaid + 1));
            nextDueDateObj = nextDueDate;

            const diffTime = nextDueDate - today;
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return { ...l, diffDays, nextDueDateObj }; // Return objek baru dengan properti tambahan
    });

    // 2. Sorting Logika
    processedLoans.sort((a, b) => {
        if (sortOrder === 'closest') {
            return a.diffDays - b.diffDays; // Terkecil (minus/dekat) ke Terbesar
        } else if (sortOrder === 'furthest') {
            return b.diffDays - a.diffDays; // Terbesar ke Terkecil
        } else {
            return b.id - a.id; // Input Terbaru (ID adalah timestamp)
        }
    });

    // 3. Render Loop
    processedLoans.forEach(l => {
        if(!l.person.toLowerCase().includes(search)) return; // Filter Search

        let dueStatusHTML = '';
        let progressLabel = ''; 

        // Logika tampilan HTML (Sedikit disesuaikan karena variabel sudah dihitung di atas)
        if (l.status === 'active') {
             const shortDate = l.nextDueDateObj.toLocaleDateString(data.settings.lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: '2-digit' });
             const tenor = parseInt(l.tenor) || 1;
             const installmentAmount = l.total / tenor;
             let monthsPaid = Math.floor((l.paid + 100) / installmentAmount);
             const currentInstallmentNo = Math.min(monthsPaid + 1, tenor);

             progressLabel = `Cicilan ${currentInstallmentNo}/${tenor}`;

             if (l.diffDays === 0) {
                dueStatusHTML = `<small class="badge-gray" style="color:var(--warning); animation: pulse 1.5s infinite;"><i class="fas fa-exclamation-circle"></i> ${t('sts_due_today', data.settings.lang)}</small>`;
            } else if (l.diffDays > 0) {
                const prefix = data.settings.lang === 'id' ? 'H-' : 'Due ';
                dueStatusHTML = `<small style="color:var(--primary); font-weight:700; font-size: 0.75rem;"><i class="fas fa-clock"></i> ${prefix}${l.diffDays} &bull; ${shortDate}</small>`;
            } else {
                dueStatusHTML = `<small class="badge-gray" style="color:var(--danger);">${t('sts_late', data.settings.lang)} ${Math.abs(l.diffDays)} ${t('sts_day', data.settings.lang)}</small>`;
            }
        } else {
            dueStatusHTML = `<small class="badge-gray" style="color:var(--success);"><i class="fas fa-check"></i> LUNAS</small>`;
            progressLabel = "Selesai";
        }

        const typeLabel = l.type === 'piutang' ? t('word_receivable', data.settings.lang) : t('word_debt', data.settings.lang);
        const remainingLabel = t('word_remaining', data.settings.lang);
        const progress = Math.min(100, (l.paid / l.total) * 100);
        const displayTenor = (l.tenor || 1) + ' ' + t('month', data.settings.lang);

        const el = document.createElement('div');
        el.className = 'card list-item';
        el.style.borderLeft = `4px solid ${l.type === 'piutang' ? 'var(--success)' : 'var(--danger)'}`;
        
        el.innerHTML = `
            <div onclick="showLoanDetail(${l.id})" style="width:100%">
                <div class="flex-between">
                    <div>
                        <strong>${l.person}</strong>
                        <div style="margin-top:4px;">${dueStatusHTML}</div>
                    </div>
                    <div style="text-align:right">
                         <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px; color:${l.type==='piutang'?'var(--success)':'var(--danger)'}">${typeLabel}</span><br>
                        <small class="text-muted" style="font-size:0.7rem;">${l.status === 'active' ? progressLabel : displayTenor}</small>
                    </div>
                </div>
                <div class="flex-between text-muted mt-10" style="font-size:0.8rem; border-top:1px dashed var(--border); padding-top:8px;">
                    <span>${remainingLabel}: <b style="color:var(--text-main)">${fmtMoney(l.total - l.paid)}</b></span>
                    <span>${Math.round(progress)}%</span>
                </div>
                <div class="goal-progress-bg">
                    <div class="goal-progress-bar" style="width:${progress}%; background:${l.type==='piutang'?'var(--success)':'var(--danger)'}"></div>
                </div>
            </div>
        `;
        if(l.status === 'active') activeList.appendChild(el);
        else historyList.appendChild(el);
    });

    // Update label Dashboard Hutang/Piutang
    document.getElementById('main-piutang').textContent = fmtMoney(totPiutang);
    document.getElementById('main-hutang').textContent = fmtMoney(totHutang);
    renderEmptyState('loan-list-active', 'msg_empty_loan', 'fa-hand-holding-usd');
    renderEmptyState('loan-list-history', 'msg_empty_loan', 'fa-history');
}

export function showLoanDetail(id) {
    const l = data.loans.find(x => x.id === id);
    if (!l) return; 
    const remaining = l.total - l.paid;
    const typeLabel = l.type === 'piutang' ? t('word_receivable', data.settings.lang) : t('word_debt', data.settings.lang);

    let historyHtml = l.history.map((h, i) => 
        `<div class="flex-between" style="border-bottom:1px dashed var(--border); padding:10px 0">
            <small class="text-muted">${fmtDate(h.date, data.settings.lang)}</small>
            <div style="display:flex; align-items:center; gap:10px;">
                <small style="font-weight:bold;">${fmtMoney(h.amount)}</small>
                <i class="fas fa-times-circle text-red" onclick="deletePayment(${l.id}, ${i})" style="cursor:pointer;" title="${t('tip_delete_pay', data.settings.lang)}"></i> 
            </div>
        </div>`
    ).join('');

    const html = `
        <div class="text-center mb-20">
            <h2>${l.person}</h2>
            <span class="badge-gray">${typeLabel}</span>
        </div>
        <div class="quick-stats-grid">
            <div class="stat-card">
                <small>${t('word_bill', data.settings.lang)}</small><strong>${fmtMoney(l.total)}</strong>
            </div>
            <div class="stat-card">
                <small>${t('word_remaining', data.settings.lang)}</small><strong class="text-red">${fmtMoney(remaining)}</strong>
            </div>
        </div>
        ${l.status === 'active' ? `
        <div class="card mt-20" style="background:var(--bg-input); border:none;">
            <h4><i class="fas fa-money-bill-wave"></i> ${t('word_pay', data.settings.lang)}</h4>
            <div class="flex-between mt-10">
                <input type="text" inputmode="numeric" class="money-input" id="pay-amount" placeholder="${t('ph_amount', data.settings.lang)}" style="margin:0; width:60%">
                <button class="btn-primary" onclick="payLoan(${l.id})" style="width:35%">${t('word_pay', data.settings.lang)}</button>
            </div>
        </div>` : `<div class="text-center text-green mt-20"><strong><i class="fas fa-check"></i> ${t('msg_paid', data.settings.lang)}</strong></div>`}
        <div class="mt-20">
            <h4>${t('lbl_pay_history', data.settings.lang)}</h4>
            ${historyHtml || '<small class="text-muted" style="display:block; text-align:center; margin-top:10px;">- ' + t('word_remaining', data.settings.lang) + ' 0 -</small>'}
        </div>
        <button class="btn-danger full-width mt-20" onclick="deleteItem('loans', ${l.id})">${t('btn_delete_data', data.settings.lang)}</button>
    `;
    
    document.getElementById('detail-content').innerHTML = html;
    openModal('modal-detail');
    initMoneyInputs(); 
}

export function payLoan(id) {
    const amount = parseMoney(document.getElementById('pay-amount').value);
    if(!amount || amount <= 0) return showToast(t('msg_invalid_amount', data.settings.lang), 'error');

    const l = data.loans.find(x => x.id === id);
    if (!l) return;

    l.paid += amount;
    l.history.push({ date: new Date().toISOString().split('T')[0], amount: amount });
    if(l.paid >= l.total) {
        l.status = 'completed';
        showToast(t('msg_paid', data.settings.lang), 'success');
    } else {
        showToast(t('msg_payment_recorded', data.settings.lang));
    }
    
    saveAppData(window.currentUser, window.dbInstance);
    closeModal('modal-detail');
    updateUI(); 
}

export function deletePayment(loanId, historyIndex) {
    showConfirmDialog(t('confirm_del_pay', data.settings.lang), function() {
        const l = data.loans.find(x => x.id === loanId);
        if (!l) return;
        const paymentAmount = l.history[historyIndex].amount;
        l.paid -= paymentAmount;
        if (l.paid < 0) l.paid = 0; 
        l.history.splice(historyIndex, 1);
        if (l.paid < l.total) l.status = 'active';
        saveAppData(window.currentUser, window.dbInstance);
        updateUI(); 
        showLoanDetail(loanId); 
        showToast(t('msg_pay_deleted', data.settings.lang));
    });
}

// --- FEATURE: EMERGENCY FUND ---
export function toggleEmergencySettings() {
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

export function saveEmergencyProfile() {
    const expense = parseMoney(document.getElementById('em-expense').value);
    const job = document.getElementById('em-job').value;
    const dependents = document.getElementById('em-dependents').value;

    if(!expense) return showToast(t('msg_complete_data', data.settings.lang), 'error');

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

    saveAppData(window.currentUser, window.dbInstance);
    toggleEmergencySettings();
    showToast(`${t('msg_prof_saved', data.settings.lang)} ${months} ${t('month', data.settings.lang)}`);
    updateUI();
}

export function addEmergencyFund() {
    const amount = parseMoney(document.getElementById('em-add-amount').value);
    if(amount > 0) {
        data.emergency.saved += amount;
        saveAppData(window.currentUser, window.dbInstance);
        closeModal('modal-emergency-add');
        document.getElementById('em-add-amount').value = '';
        showToast(`${t('em_fund_title', data.settings.lang)} +${fmtMoney(amount)}`);
        updateUI();
    } else {
        showToast(t('msg_invalid_amount', data.settings.lang), 'error');
    }
}

export function renderEmergency() {
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
    document.getElementById('emergency-circle').style.background = `conic-gradient(var(--primary) ${percent * 3.6}deg, #e0e0e0 0deg)`;
    
    const homeStatus = document.getElementById('home-emergency-status');
    if(homeStatus) {
        if(em.targetAmount === 0) homeStatus.textContent = t('em_not_set', data.settings.lang);
        else homeStatus.textContent = `${percent}% ${t('collected', data.settings.lang)}`;
    }
}

// --- SYSTEM / SETTINGS UI ---
export function deleteItem(collection, id) {
    showConfirmDialog(t('msg_confirm_del', data.settings.lang), function() {
        if (collection === 'budget') {
            const item = data.budget.find(x => x.id === id);
            if (item && item.walletId) {
                const wallet = data.wallets.find(w => w.id === item.walletId);
                if (wallet) {
                    if (item.type === 'income') wallet.balance -= item.amount;
                    else wallet.balance += item.amount;
                }
            }
        }
        data[collection] = data[collection].filter(x => x.id !== id);
        saveAppData(window.currentUser, window.dbInstance);
        updateUI(); 
        if(document.getElementById('modal-detail').classList.contains('active')) closeModal('modal-detail');
        showToast("Item berhasil dihapus");
    });
}

export function renderLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key, data.settings.lang);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        el.placeholder = t(key, data.settings.lang);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
        const key = el.getAttribute('data-i18n-label');
        el.setAttribute('data-label', t(key, data.settings.lang));
    });
    const labelLang = document.getElementById('current-lang-label');
    if(labelLang) {
        labelLang.textContent = data.settings.lang === 'id' ? 'Indonesia' : 'English';
    }
    updatePinButtonText();
}

export function openLangModal() {
    document.querySelectorAll('.lang-item').forEach(el => el.classList.remove('active'));
    document.getElementById('check-id').style.display = 'none';
    document.getElementById('check-en').style.display = 'none';
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

export function selectLang(langCode) {
    data.settings.lang = langCode;
    saveAppData(window.currentUser, window.dbInstance);
    updateUI();
    closeModal('modal-lang');
    showToast(langCode === 'id' ? "Bahasa diganti" : "Language changed");
}

export function initTheme() {
    const theme = data.settings.theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-icon').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

export function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = current === 'light' ? 'dark' : 'light';
    data.settings.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    document.getElementById('theme-icon').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    saveAppData(window.currentUser, window.dbInstance);
}

export function updateUI() {
    renderLanguage();
    renderWallets(); 
    renderBudget();
    renderBills();
    renderLoans();
    renderGoals();
    renderEmergency();
    
    renderTrendChart(); // Render grafik batang
}

export function setupConfirmListener() {
    const btn = document.getElementById('btn-conf-yes');
    if(btn) {
        btn.onclick = function() {
            if (onConfirmAction) onConfirmAction();
            closeModal('modal-confirm');
        };
    }
}

export function showConfirmDialog(message, actionCallback) {
    document.getElementById('confirm-msg').innerText = message;
    document.getElementById('confirm-title').innerText = t('lbl_confirm_title', data.settings.lang);
    document.getElementById('btn-conf-cancel').innerText = t('btn_cancel', data.settings.lang);
    document.getElementById('btn-conf-yes-text').innerText = t('btn_yes', data.settings.lang);
    onConfirmAction = actionCallback;
    openModal('modal-confirm');
}

// --- PIN LOCK ---
export function checkPinLock() {
    const savedPin = data.settings.pin;
    const overlay = document.getElementById('pin-overlay');
    if (savedPin) {
        overlay.classList.remove('hidden');
        document.getElementById('pin-title').innerText = t('enter_pin', data.settings.lang);
        document.getElementById('btn-forgot-pin').style.display = 'inline-block';
        isSettingUpPin = false;
    } else {
        overlay.classList.add('hidden');
    }
}

export function pressPin(key) {
    const dots = document.querySelectorAll('.dot');
    if (key === 'c') {
        currentPinInput = currentPinInput.slice(0, -1);
    } else if (key === 'enter') {
        // logic enter optional
    } else {
        if (currentPinInput.length < 4) currentPinInput += key;
    }
    dots.forEach((dot, index) => {
        if (index < currentPinInput.length) dot.classList.add('filled');
        else dot.classList.remove('filled');
    });
    if (currentPinInput.length === 4) setTimeout(validatePin, 200);
}

function validatePin() {
    const savedPin = data.settings.pin;
    const dots = document.querySelectorAll('.dot');
    if (isSettingUpPin) {
        data.settings.pin = currentPinInput;
        saveAppData(window.currentUser, window.dbInstance);
        showToast(t('pin_set', data.settings.lang), "success");
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
                dots.forEach(d => { d.classList.remove('error'); d.classList.remove('filled'); });
                currentPinInput = "";
            }, 400);
            showToast(t('pin_wrong', data.settings.lang), "error");
        }
    }
}

export function togglePinSetup() {
    const overlay = document.getElementById('pin-overlay');
    currentPinInput = "";
    if (data.settings.pin) {
        showConfirmDialog(t('confirm_disable_pin', data.settings.lang), function() {
            data.settings.pin = null;
            saveAppData(window.currentUser, window.dbInstance);
            showToast(t('pin_unset', data.settings.lang));
            updatePinButtonText();
        });
    } else {
        isSettingUpPin = true;
        overlay.classList.remove('hidden');
        document.getElementById('pin-title').innerText = t('setup_pin', data.settings.lang);
        document.getElementById('btn-forgot-pin').style.display = 'none';
        document.querySelectorAll('.dot').forEach(d => d.classList.remove('filled'));
    }
}

export function updatePinButtonText() {
    const btn = document.getElementById('btn-toggle-pin');
    if(btn) {
        btn.innerText = data.settings.pin ? t('disable_pin', data.settings.lang) : t('enable_pin', data.settings.lang);
        if (data.settings.pin) btn.className = "btn-xs btn-toggle-inactive"; 
        else btn.className = "btn-xs btn-toggle-active";
    }
}

// --- BACKUP/RESTORE & ADS & PDF ---

// [NEW FEATURE: PDF]
export function generatePDF() {
    if (!window.jspdf) {
        showToast("Library PDF belum siap. Coba refresh.", "error");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Kop
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235); // Primary Blue
    doc.text("Finansial Pro", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Laporan Keuangan Pribadi", 14, 26);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 32);

    // --- [MODIFIKASI] FILTER DATA ---
// 1. Ambil nilai bulan dari dropdown filter
const filterMonth = document.getElementById('filter-month') ? document.getElementById('filter-month').value : 'all';

// 2. Filter data budget berdasarkan bulan yang dipilih
let reportData = data.budget.filter(b => {
    return filterMonth === 'all' || b.date.startsWith(filterMonth);
});

// --- Ringkasan (Hitung dari data yang sudah difilter) ---
let totalIncome = 0;
let totalExpense = 0;

// [PENTING] Gunakan 'reportData', BUKAN 'data.budget'
reportData.forEach(b => {
    if (b.type === 'income') totalIncome += b.amount;
    else totalExpense += b.amount;
});

    const balance = totalIncome - totalExpense;

    doc.setDrawColor(200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 40, 180, 25, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text("Pemasukan", 20, 48);
    doc.text("Pengeluaran", 80, 48);
    doc.text("Sisa Saldo", 140, 48);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); 
    doc.text(fmtMoney(totalIncome), 20, 58);
    
    doc.setTextColor(239, 68, 68); 
    doc.text(fmtMoney(totalExpense), 80, 58);
    
    doc.setTextColor(37, 99, 235); 
    doc.text(fmtMoney(balance), 140, 58);

    // Tabel
    const tableRows = reportData.map(b => {
        const wallet = data.wallets.find(w => w.id === b.walletId);
        const walletName = wallet ? wallet.name : '-';
        return [
            fmtDate(b.date, data.settings.lang),
            b.desc,
            walletName,
            b.type === 'income' ? 'Masuk' : 'Keluar',
            fmtMoney(b.amount)
        ];
    });

    doc.autoTable({
        startY: 75,
        head: [['Tanggal', 'Keterangan', 'Dompet', 'Tipe', 'Nominal']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
        didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 4) {
                const type = tableRows[data.row.index][3];
                if (type === 'Masuk') data.cell.styles.textColor = [16, 185, 129];
                else data.cell.styles.textColor = [239, 68, 68];
            }
        }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Dibuat & Diterbitkan Oleh Finansial Pro", 14, finalY);

    doc.save(`Laporan_Keuangan_${Date.now()}.pdf`);
    showToast("Laporan PDF berhasil diunduh!");
}

export function downloadBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const date = new Date().toISOString().split('T')[0];
    downloadAnchorNode.setAttribute("download", `finpro_backup_${date}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

export function restoreBackup(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            if (json.budget && json.settings) {
                const msg = data.settings.lang === 'en' 
                    ? "Current data will be replaced with backup data. Continue?" 
                    : "Data saat ini akan ditimpa dengan data backup. Lanjutkan?";
                showConfirmDialog(msg, function() {
                    Object.assign(data, json); // Update data in place
                    saveAppData(window.currentUser, window.dbInstance);
                    alert("Restore Berhasil! Aplikasi akan dimuat ulang.");
                    location.reload();
                });
            } else {
                alert("File backup tidak valid!");
            }
        } catch (err) {
            alert("Error membaca file JSON!");
        }
    };
    reader.readAsText(file);
    input.value = ''; 
}

export function resetData() {
    showConfirmDialog(t('msg_confirm_reset', data.settings.lang), function() {
        localStorage.removeItem(APP_KEY);
        location.reload();
    });
}

// [NEW FEATURE: TREND CHART]
export function renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if(!ctx) return; 

    const labels = [];
    const dataPoints = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleDateString(data.settings.lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: '2-digit' });
        labels.push(monthName);
        
        const searchKey = d.toISOString().slice(0, 7); 
        let monthlyTotal = 0;
        data.budget.forEach(b => {
            if (b.type === 'expense' && b.date.startsWith(searchKey)) {
                monthlyTotal += b.amount;
            }
        });
        dataPoints.push(monthlyTotal);
    }

    if(trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: t('lbl_expense_type', data.settings.lang),
                data: dataPoints,
                backgroundColor: 'rgba(239, 68, 68, 0.6)', 
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 1000).toLocaleString() + 'k';
                        }
                    }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}
export function toggleAddBill() {
    const form = document.getElementById('add-bill-form');
    if (form) form.classList.toggle('hidden');
}

// --- FEATURE: CALCULATOR (INVESTASI) ---

export function toggleDcaInput() {
    const method = document.getElementById('calc-method').value;
    const dcaGroup = document.getElementById('dca-input-group');
    if (dcaGroup) {
        if (method === 'none') {
            dcaGroup.classList.add('hidden');
        } else {
            dcaGroup.classList.remove('hidden');
        }
    }
}

export function calculateCompound() {
    const P = parseMoney(document.getElementById('calc-principal').value) || 0;
    const rRaw = document.getElementById('calc-rate').value;
    const r = parseFloat(rRaw) / 100; 
    const t = parseFloat(document.getElementById('calc-years').value) || 0;
    const method = document.getElementById('calc-method').value;
    const PMT = parseMoney(document.getElementById('calc-contribution').value) || 0;

    if(t === 0) return showToast(t('msg_fill_year', data.settings.lang), 'error');

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

    // Tombol Rincian
    let btnDetail = document.getElementById('btn-calc-detail');
    if(!btnDetail) {
        const resultBox = document.querySelector('.calc-details'); 
        if(resultBox) {
            btnDetail = document.createElement('button');
            btnDetail.id = 'btn-calc-detail';
            btnDetail.className = 'btn-xs full-width mt-10';
            btnDetail.innerHTML = '<i class="fas fa-list-ol"></i> Lihat Progres Tahunan';
            btnDetail.onclick = showCalcDetail; 
            resultBox.after(btnDetail);
        }
    }
}

export function resetCalc() {
    const result = document.getElementById('calc-result');
    if(result) result.classList.add('hidden');
}

export function showCalcDetail() {
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
    if(tbody) {
        tbody.innerHTML = ''; 

        for (let i = 1; i <= t; i++) {
            let fvYear = 0;
            let investedYear = 0;

            if (method === 'none') {
                fvYear = P * Math.pow((1 + r), i);
                investedYear = P;
            } else {
                const ratePerPeriod = r / n;
                const periodsNow = n * i; 
                const fvLumpSum = P * Math.pow((1 + ratePerPeriod), periodsNow);
                const fvSeries = PMT * ((Math.pow((1 + ratePerPeriod), periodsNow) - 1) / ratePerPeriod);
                fvYear = fvLumpSum + fvSeries;
                investedYear = P + (PMT * periodsNow);
            }

            const row = document.createElement('tr');
            row.innerHTML = `<td>${i}</td><td>${fmtMoney(investedYear)}</td><td class="text-right highlight">${fmtMoney(fvYear)}</td>`;
            tbody.appendChild(row);
        }
        openModal('modal-calc-detail');
    }
}

// --- [PERBAIKAN 1] FUNGSI INIT TANGGAL TAGIHAN ---
// Panggil fungsi ini saat startApp di main.js
export function initBillDateSelect() {
    const select = document.getElementById('bill-date');
    if (select && select.children.length === 0) {
        for (let i = 1; i <= 31; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            select.appendChild(opt);
        }
    }
}

// --- [PERBAIKAN 2] FUNGSI EXPORT CSV (YANG HILANG) ---
export function exportCSV(type) {
    let csvContent = "data:text/csv;charset=utf-8,";
    let rows = [];
    
    if(type === 'budget') {
        rows.push("Tanggal,Tipe,Deskripsi,Nominal,Dompet");
        data.budget.forEach(b => {
            const w = data.wallets.find(x => x.id === b.walletId)?.name || '-';
            rows.push(`${b.date},${b.type},"${b.desc}",${b.amount},"${w}"`);
        });
    } else if(type === 'loans') {
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
    document.body.removeChild(link);
}


export function refreshAds(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const ads = container.querySelectorAll('ins.adsbygoogle');
    ads.forEach(ad => {
        if (ad.getAttribute('data-adsbygoogle-status')) return;
        if (ad.offsetWidth === 0) {
            setTimeout(() => { refreshAds(containerId); }, 300);
            return;
        }
        try {
            if (typeof window.adsbygoogle !== 'undefined') window.adsbygoogle.push({});
        } catch (e) {
            console.warn("AdSense pending...");
        }
    });
}

// [BARU] Deteksi Koneksi Internet
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const status = navigator.onLine ? "online" : "offline";
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${status === 'online' ? 'success' : 'error'}`;
    
    // Style inline ini opsional karena sudah ada di CSS, tapi boleh dibiarkan
    toast.style.background = status === 'online' ? '#10b981' : '#64748b'; 
    
    const icon = status === 'online' ? 'fa-wifi' : 'fa-plane';
    const text = status === 'online' ? 'Kembali Online' : 'Mode Offline';
    
    toast.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
