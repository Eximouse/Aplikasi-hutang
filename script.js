// --- STATE & CONFIG ---
const APP_KEY = 'finpro_elite_v1';
let data = {
    budget: [],
    loans: [],
    goals: [],
    settings: { theme: 'light', lang: 'id' }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initTheme();
    
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
    updateUI();
}

// --- MONEY & DATE FORMATTER HELPER ---
function initMoneyInputs() {
    const inputs = document.querySelectorAll('.money-input');
    inputs.forEach(input => {
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
    return parseInt(str.replace(/\./g, ''), 10);
}

function fmtMoney(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

// FUNGSI BARU: FORMAT TANGGAL DD-NamaBulan-YYYY
function fmtDate(dateString) {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    // Menggunakan locale 'id-ID' untuk mendapatkan nama bulan dalam Bahasa Indonesia
    // dan mengatur format
    let formatted = date.toLocaleDateString('id-ID', options);
    
    // Mengganti spasi menjadi hyphen, dan menghilangkan 'Tgl ' (jika ada)
    formatted = formatted.replace(/\s/g, '-').replace('Tgl-', ''); 
    return formatted;
}
// ---------------------------------------------------

// --- NAVIGATION ---
function navTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    const titles = {
        'page-home': 'Ringkasan', 'page-budget': 'Buku Kas', 
        'page-loans': 'Manajemen Pinjaman', 'page-calc': 'Simulasi Bunga Majemuk', 'page-settings': 'Pengaturan'
    };
    document.getElementById('header-title').textContent = titles[pageId];
    
    const fab = document.querySelector('.fab-wrapper');
    if (pageId === 'page-calc' || pageId === 'page-settings') {
        fab.style.display = 'none';
    } else {
        fab.style.display = 'flex';
    }
}

function switchTab(context, tabId) {
    const parent = document.getElementById(`page-${context}`);
    
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
    event.target.classList.add('active');
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

    if (!amount || !desc) return showToast('Mohon lengkapi data', 'error');

    data.budget.unshift({ id: Date.now(), type, amount, desc, date });
    saveData();
    closeModal('modal-budget');
    resetInputs('modal-budget');
    showToast('Transaksi berhasil dicatat');
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
    
    if(!name || !amount) return showToast('Data target tidak valid', 'error');
    
    data.goals.push({id: Date.now(), name, amount, saved: 0});
    saveData();
    
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-amount').value = '';
    showToast('Target baru dibuat');
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
                <span>Terkumpul: <b class="text-primary">${fmtMoney(g.saved)}</b></span>
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
    
    if(!amount || amount <= 0) return showToast('Nominal tidak valid', 'error');
    
    const goal = data.goals.find(g => g.id === id);
    if(goal) {
        goal.saved += amount;
        saveData();
        closeModal('modal-target-add');
        showToast(`Berhasil menambah Rp ${amount.toLocaleString()}`);
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

    if(!person || !principal) return showToast('Data harus lengkap', 'error');

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
    showToast('Data pinjaman tersimpan');
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
                <small class="text-muted">Tanggal: ${fmtDate(l.date)}</small>
                <div class="flex-between mt-10 text-muted">
                    <small>Sisa: ${fmtMoney(l.total - l.paid)}</small>
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
            <small>${h.date}</small>
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
                <small>Total Tagihan</small><br><strong>${fmtMoney(l.total)}</strong>
            </div>
            <div class="stat-card text-center" style="display:block">
                <small>Sisa</small><br><strong class="text-red">${fmtMoney(remaining)}</strong>
            </div>
        </div>
        
        ${l.status === 'active' ? `
        <div class="card mt-20" style="background:var(--bg-body); border:none;">
            <h4><i class="fas fa-money-bill-wave"></i> Bayar / Cicil</h4>
            <div class="flex-between mt-10">
                <input type="text" inputmode="numeric" class="money-input" id="pay-amount" placeholder="Nominal" style="margin:0; width:60%">
                <button class="btn-primary" onclick="payLoan(${l.id})" style="width:35%">Bayar</button>
            </div>
        </div>` : '<div class="card text-center text-green mt-20"><strong><i class="fas fa-check"></i> LUNAS</strong></div>'}

        <div class="mt-20">
            <h4>Riwayat Pembayaran</h4>
            ${historyHtml || '<small class="text-muted">Belum ada pembayaran</small>'}
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
        showToast('Hutang/Piutang LUNAS!', 'success');
    } else {
        showToast('Pembayaran dicatat');
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

    if(t === 0) return showToast('Durasi tahun harus diisi', 'error');

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

    // AUTO CLEAR INPUTS
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
    if(!confirm('Yakin hapus item ini?')) return;
    data[collection] = data[collection].filter(x => x.id !== id);
    saveData();
    if(document.getElementById('modal-detail').classList.contains('active')) closeModal('modal-detail');
}

function resetData() {
    if(confirm('PERINGATAN: Semua data akan hilang permanen! Lanjutkan?')) {
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
    renderBudget();
    renderLoans();
    renderGoals();
}

let chartInstance = null;
function renderChart(income, expense) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if(chartInstance) chartInstance.destroy();
    
    if(income === 0 && expense === 0) {
        income = 1; 
        expense = 0;
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pemasukan', 'Pengeluaran'],
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
