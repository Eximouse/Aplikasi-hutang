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

// --- HAPTIC FEEDBACK ---
function vibrate(pattern = [10]) {
    if (navigator.vibrate) navigator.vibrate(pattern);
}

// --- HELPER UI ---
export function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${iconClass}"></i> <span>${msg}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10); 
    setTimeout(() => toast.remove(), 3000);
}

// --- NAVIGATION ---
export function navTo(pageId, element) {
    vibrate();
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none'; 
    });
    
    const targetPage = document.getElementById(pageId);
    if(targetPage) {
        targetPage.style.display = 'block';
        setTimeout(() => targetPage.classList.add('active'), 10);
    }
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(element) element.classList.add('active');
    else {
        // Fallback update icon navigasi
        const navLinks = document.querySelectorAll('.bottom-nav .nav-item');
        if(pageId === 'page-home' && navLinks[0]) navLinks[0].classList.add('active');
        if(pageId === 'page-budget' && navLinks[1]) navLinks[1].classList.add('active');
        if(pageId === 'page-tools' && navLinks[2]) navLinks[2].classList.add('active');
        if(pageId === 'page-loans' && navLinks[3]) navLinks[3].classList.add('active');
        if(pageId === 'page-settings' && navLinks[4]) navLinks[4].classList.add('active');
    }

    const titleKeys = { 'page-home': 'nav_home', 'page-budget': 'nav_budget', 'page-loans': 'nav_loans', 'page-tools': 'nav_tools', 'page-settings': 'nav_settings' };
    const headerEl = document.getElementById('header-title');
    if(headerEl) {
        const key = titleKeys[pageId];
        headerEl.setAttribute('data-i18n', key);
        headerEl.textContent = t(key, data.settings.lang);
    }
    
    const fab = document.querySelector('.fab-wrapper');
    if(fab) fab.style.display = (pageId === 'page-settings') ? 'none' : 'flex';

    setTimeout(() => {
        if (typeof window.refreshAds === 'function') window.refreshAds(pageId);
        if (pageId === 'page-home') renderTrendChart();
    }, 100);
}

export function switchTab(context, tabId) {
    vibrate();
    const parent = document.getElementById(`page-${context}`);
    if(!parent) return;

    parent.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
    });

    const target = document.getElementById(tabId);
    if(target) {
        target.style.display = 'block';
        setTimeout(() => target.classList.add('active'), 10);
    }
    
    parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');
}

// --- MODALS (Bottom Sheet) ---
export function openModal(id) {
    vibrate([15]);
    const modal = document.getElementById(id);
    if(!modal) return;
    
    modal.classList.add('active');
    const fabMenu = document.getElementById('fab-menu');
    if(fabMenu && fabMenu.classList.contains('active')) toggleFab();

    history.pushState({ modalId: id }, null, window.location.href);
}

export function closeModal(id) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.classList.remove('active');
        resetInputs(id);
        if (history.state && history.state.modalId === id) history.back();
    }
}

// Handle Back Button Android
window.addEventListener('popstate', (event) => {
    const activeModal = document.querySelector('.modal-overlay.active');
    if(activeModal) {
        activeModal.classList.remove('active');
        resetInputs(activeModal.id);
    }
});

function resetInputs(containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    container.querySelectorAll('input:not([type="radio"]):not([type="hidden"])').forEach(input => input.value = '');
    
    const today = new Date().toISOString().split('T')[0];
    const dateInput = container.querySelector('input[type="date"]');
    if(dateInput) dateInput.value = today;

    // Reset ID Edit untuk Budget
    if(containerId === 'modal-budget') {
        const defaultRadio = document.getElementById('t-out');
        if(defaultRadio) defaultRadio.checked = true;
        document.getElementById('b-id').value = ''; 
    }
}

export function toggleFab() {
    vibrate();
    const menu = document.getElementById('fab-menu');
    const icon = document.getElementById('fab-icon');
    if(menu) menu.classList.toggle('active');
    if(icon) {
        icon.classList.toggle('fa-plus');
        icon.classList.toggle('fa-times');
    }
}

function renderEmptyState(containerId, messageKey, iconClass = 'fa-clipboard-list') {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (container.children.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 20px; opacity:0.6;">
                <div style="background:var(--bg-input); width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px;">
                    <i class="fas ${iconClass}" style="font-size:1.5rem; color:var(--text-muted);"></i>
                </div>
                <p class="text-muted">${t(messageKey, data.settings.lang)}</p>
            </div>
        `;
    }
}

// --- RENDER FUNCTIONS ---
export function renderWallets() {
    const container = document.getElementById('wallet-list');
    const select = document.getElementById('b-wallet');
    if(!container || !select) return;

    container.innerHTML = ''; select.innerHTML = '';
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
            <div class="mb-10 text-xl"><i class="fas ${iconClass}"></i></div>
            <small class="block opacity-80">${displayName}</small>
            <strong>${fmtMoney(w.balance)}</strong>
        `;
        container.appendChild(el);

        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `${displayName} (${fmtMoney(w.balance)})`;
        select.appendChild(opt);
    });
    
    const balanceEl = document.getElementById('main-balance');
    if(balanceEl) balanceEl.textContent = fmtMoney(globalTotal);
}

export function renderBudget() {
    const list = document.getElementById('budget-list');
    const searchInput = document.getElementById('budget-search');
    const keyword = searchInput ? searchInput.value.toLowerCase() : "";

    if(!list) return;
    list.innerHTML = '';
    
    let income = 0, expense = 0;
    const filteredData = data.budget.filter(b => b.desc.toLowerCase().includes(keyword));

    filteredData.forEach(b => {
        if (b.type === 'income') income += b.amount; else expense += b.amount;
        let walletName = '-';
        const w = data.wallets.find(x => x.id === b.walletId);
        if (w) walletName = w.name;

        const el = document.createElement('div');
        el.className = `list-item ripple`;
        el.onclick = () => editBudget(b.id);
        
        const iconColor = b.type === 'income' ? 'text-green' : 'text-red';
        const bgIcon = b.type === 'income' ? 'bg-green-light' : 'bg-red-light';
        const arrow = b.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up';

        el.innerHTML = `
            <div class="flex-center gap-10">
                <div class="stat-icon ${bgIcon}" style="width:40px; height:40px; border-radius:12px;">
                    <i class="fas ${arrow} ${iconColor}"></i>
                </div>
                <div>
                    <div class="font-bold">${b.desc}</div>
                    <small class="text-muted">${fmtDate(b.date, data.settings.lang)} &bull; ${walletName}</small>
                </div>
            </div>
            <div class="text-right">
                <div class="font-bold ${iconColor}">${b.type === 'income' ? '+' : '-'} ${fmtMoney(b.amount)}</div>
                <i class="fas fa-trash text-muted mt-10" onclick="event.stopPropagation(); deleteItem('budget', ${b.id})" style="font-size:0.8rem; padding:5px;"></i>
            </div>
        `;
        list.appendChild(el);
    });
    
    document.getElementById('main-income').textContent = fmtMoney(income);
    document.getElementById('main-expense').textContent = fmtMoney(expense);
    renderChart(income, expense);
    if(filteredData.length === 0) renderEmptyState('budget-list', 'msg_empty_trans');
}

export function renderChart(income, expense) {
    const ctx = document.getElementById('mainChart');
    if(!ctx) return;
    if(chartInstance) chartInstance.destroy();
    if(income === 0 && expense === 0) { income = 1; expense = 0; }
    
    chartInstance = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [t('lbl_income_type', data.settings.lang), t('lbl_expense_type', data.settings.lang)],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            cutout: '70%', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } } }
        }
    });
}

// --- LOGIKA EDIT & SAVE BUDGET (100% FIXED) ---
export function saveBudget() {
    vibrate();
    const id = document.getElementById('b-id').value; 
    const typeRadio = document.querySelector('input[name="b-type"]:checked');
    const type = typeRadio ? typeRadio.value : 'expense';
    const amount = parseMoney(document.getElementById('b-amount').value);
    const desc = document.getElementById('b-desc').value;
    const date = document.getElementById('b-date').value;
    const walletId = parseInt(document.getElementById('b-wallet').value);

    if (!amount || !desc) return showToast(t('msg_complete_data', data.settings.lang), 'error');

    if (id) {
        // --- KASUS EDIT: Saldo Lama Dikembalikan (Revert) ---
        const oldItem = data.budget.find(b => b.id == id);
        if (oldItem) {
            const oldWallet = data.wallets.find(w => w.id === oldItem.walletId);
            if (oldWallet) {
                // Jika dulunya Income, sekarang saldo dikurangi (karena dianggap batal masuk)
                if (oldItem.type === 'income') oldWallet.balance -= oldItem.amount;
                // Jika dulunya Expense, sekarang saldo ditambah (karena dianggap uang kembali)
                else oldWallet.balance += oldItem.amount;
            }
            
            // Update Data Item
            oldItem.type = type; 
            oldItem.amount = amount; 
            oldItem.desc = desc; 
            oldItem.date = date; 
            oldItem.walletId = walletId;
            
            // --- KASUS EDIT: Saldo Baru Diterapkan ---
            const newWallet = data.wallets.find(w => w.id === walletId);
            if (newWallet) {
                if (type === 'income') newWallet.balance += amount;
                else newWallet.balance -= amount;
            }
            showToast("Transaksi diperbarui");
        }
    } else {
        // --- KASUS BARU ---
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

export function editBudget(id) {
    const item = data.budget.find(b => b.id === id);
    if (!item) return;
    
    // Isi Form
    document.getElementById('b-id').value = item.id;
    document.getElementById('b-amount').value = item.amount.toLocaleString('id-ID');
    document.getElementById('b-desc').value = item.desc;
    document.getElementById('b-date').value = item.date;
    if(item.walletId) document.getElementById('b-wallet').value = item.walletId;
    
    // Set Radio Button
    if (item.type === 'income') document.getElementById('t-in').checked = true;
    else document.getElementById('t-out').checked = true;
    
    openModal('modal-budget');
}

// --- BILLS ---
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

        let statusBadge = '';
        let actionBtn = '';
        
        if (isPaid) {
            statusBadge = `<span class="badge-pill text-green bg-green-light"><i class="fas fa-check"></i> ${t('status_paid', data.settings.lang)}</span>`;
        } else {
            // Logika Telat
            if (currentDay > bill.dueDay) {
                statusBadge = `<span class="badge-pill text-red bg-red-light font-bold">TELAT</span>`;
            } else {
                statusBadge = `<span class="badge-pill">${t('status_unpaid', data.settings.lang)}</span>`;
            }
            actionBtn = `<button class="btn-xs mt-10" onclick="payBill(${bill.id})" style="border:1px solid var(--primary); color:var(--primary); background:transparent;">${t('btn_pay_bill', data.settings.lang)}</button>`;
        }

        const el = document.createElement('div');
        el.className = `list-item ripple`;
        el.innerHTML = `
            <div>
                <strong class="text-base">${bill.name}</strong>
                <div class="text-sm text-muted mt-5">Tgl ${bill.dueDay} &bull; ${fmtMoney(bill.amount)}</div>
                ${actionBtn}
            </div>
            <div class="text-right flex flex-col items-end gap-5">
                ${statusBadge}
                <i class="fas fa-trash text-muted mt-10" onclick="deleteItem('bills', ${bill.id})"></i>
            </div>
        `;
        list.appendChild(el);
    });

    const summary = document.getElementById('bill-status-summary');
    if(summary) summary.textContent = `${paidCount}/${data.bills.length} Lunas`;
    renderEmptyState('bill-list', 'msg_empty_bill', 'fa-file-invoice');
}

export function saveBill() {
    vibrate();
    const name = document.getElementById('bill-name').value;
    const amount = parseMoney(document.getElementById('bill-amount').value);
    const dueDay = parseInt(document.getElementById('bill-date').value);
    if(!name || !amount) return showToast(t('msg_complete_data', data.settings.lang), 'error');
    data.bills.push({ id: Date.now(), name, amount, dueDay, lastPaidMonth: null });
    saveAppData(window.currentUser, window.dbInstance);
    toggleAddBill();
    showToast(t('msg_trans_saved', data.settings.lang));
    updateUI();
}
export function toggleAddBill() {
    const form = document.getElementById('add-bill-form');
    if (form) form.classList.toggle('hidden');
}
export function payBill(id) {
    vibrate();
    const bill = data.bills.find(b => b.id === id);
    if(!bill) return;
    const wallet = data.wallets.find(w => w.id === 2);
    if(wallet) wallet.balance -= bill.amount;
    data.budget.unshift({ id: Date.now(), type: 'expense', amount: bill.amount, desc: `[Tagihan] ${bill.name}`, date: new Date().toISOString().split('T')[0], walletId: 2 });
    bill.lastPaidMonth = new Date().toISOString().slice(0, 7);
    saveAppData(window.currentUser, window.dbInstance);
    showToast(t('msg_bill_paid', data.settings.lang));
    updateUI();
}

// --- LOANS (LOGIKA MATEMATIKA ASLI) ---
export function renderLoans() {
    const activeList = document.getElementById('loan-list-active');
    const historyList = document.getElementById('loan-list-history');
    const search = document.getElementById('loan-search').value.toLowerCase();
    
    if(!activeList || !historyList) return;
    activeList.innerHTML = ''; historyList.innerHTML = '';
    let totPiutang = 0, totHutang = 0;
    const today = new Date(); today.setHours(0,0,0,0); 

    data.loans.forEach(l => {
        if(l.status === 'active') {
            const rem = l.total - l.paid;
            if(l.type === 'piutang') totPiutang += rem; else totHutang += rem;
        }
        if(!l.person.toLowerCase().includes(search)) return;

        let statusInfo = '';
        let progressLabel = '';

        // Hitung Jatuh Tempo / Telat
        if (l.status === 'active') {
            const transDate = new Date(l.date); transDate.setHours(0,0,0,0);
            const tenor = parseInt(l.tenor) || 1;
            const installmentAmount = l.total / tenor;
            
            let monthsPaid = Math.floor((l.paid + 100) / installmentAmount); 
            if (monthsPaid >= tenor) monthsPaid = tenor - 1;

            let nextDueDate = new Date(transDate);
            nextDueDate.setMonth(transDate.getMonth() + (monthsPaid + 1));

            const currentInstallmentNo = monthsPaid + 1;
            progressLabel = `Cicilan ${currentInstallmentNo}/${tenor}`;

            const diffTime = nextDueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            const shortDate = nextDueDate.toLocaleDateString(data.settings.lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' });

            if (diffDays === 0) {
                 statusInfo = `<small class="badge-pill bg-warning text-white" style="animation: pulse 1.5s infinite;"><i class="fas fa-exclamation-circle"></i> HARI INI</small>`;
            } else if (diffDays > 0) {
                 const prefix = data.settings.lang === 'id' ? 'H-' : 'Due ';
                 statusInfo = `<small class="text-xs font-bold text-primary"><i class="fas fa-clock"></i> ${prefix}${diffDays} &bull; ${shortDate}</small>`;
            } else {
                 statusInfo = `<small class="badge-pill bg-red-light text-red font-bold">TELAT ${Math.abs(diffDays)} HARI</small>`;
            }
        } else {
            statusInfo = `<small class="badge-pill bg-green-light text-green">LUNAS</small>`;
            progressLabel = "Selesai";
        }

        const isPiutang = l.type === 'piutang';
        const colorClass = isPiutang ? 'text-green' : 'text-red';
        const bgClass = isPiutang ? 'bg-green-light' : 'bg-red-light';
        const typeLabel = isPiutang ? 'Piutang' : 'Hutang';
        const progress = Math.min(100, (l.paid / l.total) * 100);

        const el = document.createElement('div');
        el.className = 'list-item ripple';
        el.onclick = () => showLoanDetail(l.id);

        el.innerHTML = `
            <div class="w-full">
                <div class="flex-between">
                    <div class="flex-center gap-10">
                         <div class="stat-icon ${bgClass}"><i class="fas ${isPiutang ? 'fa-hand-holding-usd' : 'fa-file-invoice-dollar'} ${colorClass}"></i></div>
                         <div>
                            <strong>${l.person}</strong>
                            <div class="mt-1">${statusInfo}</div>
                         </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold">${fmtMoney(l.total - l.paid)}</div>
                        <small class="text-muted text-xs">${progressLabel}</small>
                    </div>
                </div>
                <div style="background:var(--bg-input); height:6px; border-radius:3px; margin-top:10px; overflow:hidden;">
                    <div style="width:${progress}%; background:var(${isPiutang ? '--success' : '--danger'}); height:100%;"></div>
                </div>
            </div>
        `;

        if(l.status === 'active') activeList.appendChild(el);
        else historyList.appendChild(el);
    });

    document.getElementById('main-piutang').textContent = fmtMoney(totPiutang);
    document.getElementById('main-hutang').textContent = fmtMoney(totHutang);
    renderEmptyState('loan-list-active', 'msg_empty_loan');
}

export function calcLoanPreview() {
    const p = parseMoney(document.getElementById('l-principal').value) || 0;
    const r = parseFloat(document.getElementById('l-rate').value) || 0;
    const t = parseFloat(document.getElementById('l-tenor').value) || 1;
    const totalInterest = p * (r/100) * t;
    const total = p + totalInterest;
    document.getElementById('prev-total').textContent = fmtMoney(total);
    document.getElementById('prev-installment').textContent = fmtMoney(total/t);
}

export function saveLoan() {
    vibrate();
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
    updateUI();
}

export function showLoanDetail(id) {
    vibrate();
    const l = data.loans.find(x => x.id === id);
    if (!l) return;
    
    const historyHtml = l.history.map((h, i) => `
        <div class="flex-between py-2 border-b border-gray-100">
            <span class="text-sm text-muted">${fmtDate(h.date, data.settings.lang)}</span>
            <div class="flex-center gap-10">
                <span class="font-bold">${fmtMoney(h.amount)}</span>
                <i class="fas fa-trash text-red cursor-pointer" onclick="deletePayment(${l.id}, ${i})"></i>
            </div>
        </div>
    `).join('');

    const html = `
        <div class="text-center mb-20">
            <h2 class="text-2xl font-bold">${l.person}</h2>
            <div class="badge-pill mt-5">${l.type.toUpperCase()}</div>
        </div>
        <div class="quick-stats-grid">
            <div class="stat-card text-center">
                <small class="text-muted">Total</small>
                <strong class="text-lg">${fmtMoney(l.total)}</strong>
            </div>
            <div class="stat-card text-center">
                <small class="text-muted">Sisa</small>
                <strong class="text-lg text-red">${fmtMoney(l.total - l.paid)}</strong>
            </div>
        </div>
        ${l.status === 'active' ? `
        <div class="card bg-gray-50 border-0 p-4 mt-20">
            <label class="text-sm font-bold mb-2 block">Bayar Cicilan</label>
            <div class="flex gap-2">
                <input type="text" class="money-input flex-1" id="pay-amount" placeholder="Nominal">
                <button class="btn-primary" onclick="payLoan(${l.id})">Bayar</button>
            </div>
        </div>` : `<div class="p-4 bg-green-50 text-green text-center rounded-xl font-bold mt-20">LUNAS</div>`}

        <div class="mt-20">
            <h4 class="mb-10 text-sm uppercase text-muted font-bold">Riwayat</h4>
            ${historyHtml || '<p class="text-center text-sm text-muted py-4">Belum ada pembayaran</p>'}
        </div>
        <button class="btn-danger full-width mt-20" onclick="deleteItem('loans', ${l.id})">Hapus Data</button>
    `;
    document.getElementById('detail-content').innerHTML = html;
    openModal('modal-detail');
    initMoneyInputs();
}

export function payLoan(id) {
    vibrate();
    const amount = parseMoney(document.getElementById('pay-amount').value);
    const l = data.loans.find(x => x.id === id);
    if(l && amount > 0) {
        l.paid += amount;
        l.history.push({ date: new Date().toISOString().split('T')[0], amount });
        if(l.paid >= l.total) l.status = 'completed';
        saveAppData(window.currentUser, window.dbInstance);
        closeModal('modal-detail');
        updateUI();
        showToast("Pembayaran dicatat");
    }
}
export function deletePayment(loanId, index) {
    showConfirmDialog("Hapus pembayaran ini?", () => {
        const l = data.loans.find(x => x.id === loanId);
        if(l) {
            l.paid -= l.history[index].amount;
            l.history.splice(index, 1);
            l.status = 'active';
            saveAppData(window.currentUser, window.dbInstance);
            closeModal('modal-detail');
            updateUI();
        }
    });
}

// --- GOALS ---
export function addGoal() {
    vibrate();
    const name = document.getElementById('goal-name').value;
    const amount = parseMoney(document.getElementById('goal-amount').value);
    if(name && amount) {
        data.goals.push({ id: Date.now(), name, amount, saved: 0 });
        saveAppData(window.currentUser, window.dbInstance);
        document.getElementById('goal-name').value = '';
        document.getElementById('goal-amount').value = '';
        updateUI();
        showToast("Target dibuat");
    }
}
export function renderGoals() {
    const list = document.getElementById('goal-list');
    if(!list) return;
    list.innerHTML = '';
    
    data.goals.forEach(g => {
        const percent = Math.min(100, Math.round((g.saved / g.amount) * 100));
        const el = document.createElement('div');
        el.className = 'list-item ripple block';
        el.onclick = (e) => {
            if(!e.target.closest('.btn-xs')) {
                document.getElementById('target-current-id').value = g.id;
                document.getElementById('target-add-amount').value = '';
                openModal('modal-target-add');
            }
        };

        el.innerHTML = `
            <div class="flex-between mb-5">
                <strong>${g.name}</strong>
                <span class="text-sm font-bold text-primary">${percent}%</span>
            </div>
            <div style="height:8px; background:var(--bg-input); border-radius:4px; overflow:hidden; margin-bottom:8px;">
                <div style="width:${percent}%; background:var(--primary); height:100%;"></div>
            </div>
            <div class="flex-between text-xs text-muted">
                <span>${fmtMoney(g.saved)} / ${fmtMoney(g.amount)}</span>
                <button class="btn-xs text-red" style="padding:4px 8px;" onclick="event.stopPropagation(); deleteItem('goals', ${g.id})">Hapus</button>
            </div>
        `;
        list.appendChild(el);
    });
    renderEmptyState('goal-list', 'msg_empty_goal', 'fa-bullseye');
}
export function saveTargetSavings() {
    vibrate();
    const id = parseInt(document.getElementById('target-current-id').value);
    const amount = parseMoney(document.getElementById('target-add-amount').value);
    const g = data.goals.find(x => x.id === id);
    if(g && amount > 0) {
        g.saved += amount;
        saveAppData(window.currentUser, window.dbInstance);
        closeModal('modal-target-add');
        updateUI();
        showToast("Tabungan ditambahkan");
    }
}

// --- EMERGENCY ---
export function toggleEmergencySettings() {
    const form = document.getElementById('emergency-settings-form');
    if(!form) return;
    form.classList.toggle('hidden');
    if(!form.classList.contains('hidden')) {
        document.getElementById('em-expense').value = data.emergency.expense.toLocaleString('id-ID');
        document.getElementById('em-job').value = data.emergency.job;
        document.getElementById('em-dependents').value = data.emergency.dependents;
    }
}
export function saveEmergencyProfile() {
    const exp = parseMoney(document.getElementById('em-expense').value);
    const job = document.getElementById('em-job').value;
    const dep = document.getElementById('em-dependents').value;
    let m = 6;
    if(job === 'freelance') m += 3;
    if(dep === '1') m += 3; else if(dep === '3') m += 6;
    data.emergency.expense = exp; data.emergency.job = job; data.emergency.dependents = dep;
    data.emergency.targetMonths = m; data.emergency.targetAmount = m * exp;
    saveAppData(window.currentUser, window.dbInstance);
    toggleEmergencySettings();
    updateUI();
    showToast("Profil disimpan");
}
export function addEmergencyFund() {
    const amt = parseMoney(document.getElementById('em-add-amount').value);
    if(amt > 0) {
        data.emergency.saved += amt;
        saveAppData(window.currentUser, window.dbInstance);
        closeModal('modal-emergency-add');
        updateUI();
        showToast("Dana ditambahkan");
    }
}
export function renderEmergency() {
    if(!data.emergency) return;
    const em = data.emergency;
    const elTarget = document.getElementById('em-target-rp');
    const elSaved = document.getElementById('em-current-rp');
    if(elTarget) elTarget.textContent = fmtMoney(em.targetAmount);
    if(elSaved) elSaved.textContent = fmtMoney(em.saved);
    if(document.getElementById('em-target-month')) document.getElementById('em-target-month').textContent = em.targetMonths;
    let p = em.targetAmount > 0 ? Math.round((em.saved / em.targetAmount) * 100) : 0;
    if(p > 100) p = 100;
    if(document.getElementById('em-percent')) document.getElementById('em-percent').textContent = p + "%";
    const circle = document.getElementById('emergency-circle');
    if(circle) circle.style.background = `conic-gradient(var(--primary) ${p * 3.6}deg, var(--bg-input) 0deg)`;
}

// --- SYSTEM ---
export function deleteItem(collection, id) {
    showConfirmDialog("Hapus item ini?", () => {
        vibrate([30]);
        if(collection === 'budget') {
            const b = data.budget.find(x => x.id === id);
            if(b) {
                const w = data.wallets.find(w => w.id === b.walletId);
                if(w) {
                    if(b.type === 'income') w.balance -= b.amount;
                    else w.balance += b.amount;
                }
            }
        }
        data[collection] = data[collection].filter(x => x.id !== id);
        saveAppData(window.currentUser, window.dbInstance);
        const detailModal = document.getElementById('modal-detail');
        if(detailModal && detailModal.classList.contains('active')) closeModal('modal-detail');
        updateUI();
        showToast("Item dihapus");
    });
}
export function resetData() {
    showConfirmDialog("RESET SEMUA DATA? Tidak bisa dikembalikan!", () => {
        localStorage.removeItem(APP_KEY);
        location.reload();
    });
}

// --- CHART & UTILS ---
export function renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if(!ctx) return;
    const labels = []; const points = []; const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(d.toLocaleDateString(data.settings.lang === 'id' ? 'id-ID' : 'en-US', { month: 'short' }));
        const key = d.toISOString().slice(0, 7);
        let sum = 0;
        data.budget.forEach(b => { if(b.type === 'expense' && b.date.startsWith(key)) sum += b.amount; });
        points.push(sum);
    }
    if(trendChartInstance) trendChartInstance.destroy();
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)'); gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
    trendChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: { labels: labels, datasets: [{ label: 'Pengeluaran', data: points, borderColor: '#ef4444', backgroundColor: gradient, fill: true, tension: 0.4, pointRadius: 4 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } }, maintainAspectRatio: false }
    });
}

// --- UTILS (RESTORED & IMPROVED) ---
export function initBillDateSelect() {
    const select = document.getElementById('bill-date');
    if(select && select.children.length === 0) {
        for(let i=1; i<=31; i++) {
            const o = document.createElement('option'); o.value = i; o.textContent = i; select.appendChild(o);
        }
    }
}
export function exportCSV(type) {
    let csv = "data:text/csv;charset=utf-8,";
    if(type === 'budget') {
        csv += "Tanggal,Tipe,Deskripsi,Nominal,Dompet\r\n";
        data.budget.forEach(b => { const w = data.wallets.find(x => x.id === b.walletId)?.name || '-'; csv += `${b.date},${b.type},"${b.desc}",${b.amount},"${w}"\r\n` });
    } else {
        csv += "Tanggal,Tipe,Nama,Total,Terbayar,Status\r\n";
        data.loans.forEach(l => csv += `${l.date},${l.type},"${l.person}",${l.total},${l.paid},${l.status}\r\n`);
    }
    const link = document.createElement("a"); link.href = encodeURI(csv); link.download = `finpro_${type}_${Date.now()}.csv`; link.click();
}
export function generatePDF() {
    if (!window.jspdf) return showToast("Library PDF belum siap", "error");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(37, 99, 235); doc.text("Finansial Pro", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text("Laporan Keuangan", 14, 26);
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 32);
    let inc = 0, exp = 0; data.budget.forEach(b => { if (b.type === 'income') inc += b.amount; else exp += b.amount; });
    doc.setFillColor(248, 250, 252); doc.roundedRect(14, 40, 180, 25, 3, 3, 'FD');
    doc.text("Pemasukan", 20, 48); doc.text("Pengeluaran", 80, 48); doc.text("Sisa", 140, 48);
    doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); doc.text(fmtMoney(inc), 20, 58);
    doc.setTextColor(239, 68, 68); doc.text(fmtMoney(exp), 80, 58);
    doc.setTextColor(37, 99, 235); doc.text(fmtMoney(inc-exp), 140, 58);
    const rows = data.budget.map(b => {
        const w = data.wallets.find(x => x.id === b.walletId)?.name || '-';
        return [fmtDate(b.date, data.settings.lang), b.desc, w, b.type==='income'?'Masuk':'Keluar', fmtMoney(b.amount)];
    });
    doc.autoTable({ startY: 75, head: [['Tgl', 'Ket', 'Dompet', 'Tipe', 'Nominal']], body: rows, theme: 'grid', headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 8, cellPadding: 3 }, columnStyles: { 4: { halign: 'right' } } });
    doc.save(`Laporan_${Date.now()}.pdf`);
    showToast("PDF berhasil diunduh");
}
export function downloadBackup() { const s = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data)); const a = document.createElement('a'); a.href = s; a.download = `backup_${Date.now()}.json`; a.click(); }
export function restoreBackup(input) {
    const f = input.files[0]; if(!f) return; const r = new FileReader();
    r.onload = (e) => { try { const j = JSON.parse(e.target.result); if(j.budget) { Object.assign(data, j); saveAppData(window.currentUser, window.dbInstance); location.reload(); } } catch(e) { alert("File rusak"); } };
    r.readAsText(f);
}
export function toggleDcaInput() { const m = document.getElementById('calc-method').value; const g = document.getElementById('dca-input-group'); if(g) g.classList.toggle('hidden', m === 'none'); }
export function calculateCompound() {
    const P = parseMoney(document.getElementById('calc-principal').value) || 0;
    const r = (parseFloat(document.getElementById('calc-rate').value) || 0) / 100;
    const t = parseFloat(document.getElementById('calc-years').value) || 0;
    const method = document.getElementById('calc-method').value;
    const PMT = parseMoney(document.getElementById('calc-contribution').value) || 0;
    if(t === 0) return;
    let n = 1; if(method === 'daily') n = 365; else if(method === 'monthly') n = 12;
    const tbody = document.getElementById('calc-breakdown-list'); if(tbody) tbody.innerHTML = '';
    let finalFv = 0;
    for (let i = 1; i <= t; i++) {
        let fvYear = 0;
        if(method === 'none') fvYear = P * Math.pow(1+r, i);
        else { const rateP = r/n; const totalP = n * i; fvYear = (P * Math.pow(1+rateP, totalP)) + (PMT * ((Math.pow(1+rateP, totalP)-1)/rateP)); }
        if (i === t) finalFv = fvYear;
        if(tbody) { const row = document.createElement('tr'); const totalInvested = method === 'none' ? P : (P + (PMT * n * i)); row.innerHTML = `<td>${i}</td><td>${fmtMoney(totalInvested)}</td><td class="text-right font-bold text-primary">${fmtMoney(fvYear)}</td>`; tbody.appendChild(row); }
    }
    document.getElementById('calc-result').classList.remove('hidden');
    document.getElementById('calc-total-display').textContent = fmtMoney(finalFv);
    document.getElementById('calc-principal-display').textContent = fmtMoney(method==='none' ? P : (P+(PMT*n*t)));
    document.getElementById('calc-interest-display').textContent = fmtMoney(finalFv - (method==='none' ? P : (P+(PMT*n*t))));
    let btnDetail = document.getElementById('btn-show-calc-detail');
    if(!btnDetail) { const detailsBox = document.querySelector('.calc-details'); if(detailsBox) { btnDetail = document.createElement('button'); btnDetail.id = 'btn-show-calc-detail'; btnDetail.className = 'btn-xs full-width mt-10'; btnDetail.innerHTML = '<i class="fas fa-list-ol"></i> Lihat Tabel'; btnDetail.onclick = () => openModal('modal-calc-detail'); detailsBox.after(btnDetail); } }
}
export function resetCalc() { document.getElementById('calc-result').classList.add('hidden'); const btn = document.getElementById('btn-show-calc-detail'); if(btn) btn.remove(); }
export function refreshAds(containerId) {
    const container = document.getElementById(containerId); if (!container) return;
    const ads = container.querySelectorAll('ins.adsbygoogle');
    ads.forEach(ad => { if (ad.getAttribute('data-adsbygoogle-status')) return; if (ad.offsetWidth === 0) { setTimeout(() => { refreshAds(containerId); }, 500); return; } try { if (typeof window.adsbygoogle !== 'undefined') window.adsbygoogle.push({}); } catch (e) { console.warn("AdSense pending..."); } });
}
export function showConfirmDialog(msg, callback) {
    vibrate([20]); document.getElementById('confirm-msg').textContent = msg; onConfirmAction = callback;
    const modal = document.getElementById('modal-confirm'); if(modal) { modal.classList.add('active'); history.pushState({ modalId: 'modal-confirm' }, null, window.location.href); }
}
export function setupConfirmListener() { const btn = document.getElementById('btn-conf-yes'); if(btn) { btn.onclick = () => { if(onConfirmAction) onConfirmAction(); closeModal('modal-confirm'); }; } }
export function togglePinSetup() {
    if(data.settings.pin) { showConfirmDialog("Matikan PIN?", () => { data.settings.pin = null; saveAppData(window.currentUser, window.dbInstance); updatePinButtonText(); showToast("PIN Dimatikan"); });
    } else { isSettingUpPin = true; document.getElementById('pin-overlay').classList.remove('hidden'); document.getElementById('pin-title').textContent = "Buat PIN Baru (4 Angka)"; document.querySelectorAll('.dot').forEach(d => d.classList.remove('filled')); currentPinInput = ""; }
}
export function pressPin(key) {
    vibrate([5]); if(key === 'c') currentPinInput = currentPinInput.slice(0, -1); else if(key !== 'enter' && currentPinInput.length < 4) currentPinInput += key;
    const dots = document.querySelectorAll('.dot'); dots.forEach((d, i) => { if(i < currentPinInput.length) d.classList.add('filled'); else d.classList.remove('filled'); });
    if(currentPinInput.length === 4) setTimeout(validatePin, 100);
}
function validatePin() {
    if(isSettingUpPin) { data.settings.pin = currentPinInput; saveAppData(window.currentUser, window.dbInstance); document.getElementById('pin-overlay').classList.add('hidden'); isSettingUpPin = false; updatePinButtonText(); showToast("PIN Diaktifkan");
    } else { if(currentPinInput === data.settings.pin) { document.getElementById('pin-overlay').classList.add('hidden'); } else { vibrate([50, 50, 50]); currentPinInput = ""; document.querySelectorAll('.dot').forEach(d => d.classList.remove('filled')); showToast("PIN Salah!", "error"); } }
}
export function checkPinLock() { if(data.settings.pin) { document.getElementById('pin-overlay').classList.remove('hidden'); document.getElementById('pin-title').textContent = "Masukkan PIN"; document.getElementById('btn-forgot-pin').style.display = "block"; } }
export function updatePinButtonText() { const btn = document.getElementById('btn-toggle-pin'); if(btn) { btn.textContent = data.settings.pin ? "Nonaktifkan PIN" : "Aktifkan PIN"; btn.className = data.settings.pin ? "btn-xs text-red border-red" : "btn-xs text-primary border-primary"; } }
export function toggleTheme() { vibrate(); const cur = data.settings.theme; data.settings.theme = cur === 'light' ? 'dark' : 'light'; initTheme(); saveAppData(window.currentUser, window.dbInstance); }
export function initTheme() { document.documentElement.setAttribute('data-theme', data.settings.theme); const icon = document.getElementById('theme-icon'); if(icon) icon.className = data.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'; }
export function openLangModal() { openModal('modal-lang'); }
export function selectLang(code) { data.settings.lang = code; saveAppData(window.currentUser, window.dbInstance); updateUI(); closeModal('modal-lang'); document.getElementById('check-id').style.display = code === 'id' ? 'block' : 'none'; document.getElementById('check-en').style.display = code === 'en' ? 'block' : 'none'; document.getElementById('current-lang-label').textContent = code === 'id' ? 'Indonesia' : 'English'; }
export function updateUI() {
    renderWallets(); renderBudget(); renderBills(); renderLoans(); renderGoals(); renderEmergency(); renderTrendChart(); updatePinButtonText();
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n'), data.settings.lang); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-ph'), data.settings.lang); });
}
window.addEventListener('online', () => showToast("Kembali Online", "success"));
window.addEventListener('offline', () => showToast("Mode Offline", "error"));
