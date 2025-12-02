// Logika transaksi, kategori, dan grafik.

import { data, saveAppData } from '../db.js';
import { t, fmtMoney, fmtDate, parseMoney } from '../utils.js';
import { CATEGORIES, showToast } from './core.js';
import { openModal, closeModal } from './nav.js';
import { updateUI, deleteItem } from './index.js'; // Import aggregator

let chartInstance = null;
let trendChartInstance = null;

// --- RENDER KATEGORI ---
export function renderCategorySelector(type = 'expense') {
    const wrapper = document.getElementById('category-wrapper');
    const input = document.getElementById('b-category');
    if(!wrapper || !input) return;

    wrapper.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'category-grid';

    const cats = CATEGORIES[type] || CATEGORIES['expense'];
    if(!input.value) input.value = cats[0].id;

    cats.forEach(c => {
        const item = document.createElement('div');
        item.className = `cat-item ${input.value === c.id ? 'active' : ''}`;
        item.onclick = function() {
            document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            input.value = c.id;
        };
        item.innerHTML = `
            <div class="cat-icon" style="background:${c.color}">
                <i class="fas ${c.icon}"></i>
            </div>
            <span>${t(c.nameKey, data.settings.lang)}</span>
        `;
        grid.appendChild(item);
    });
    wrapper.appendChild(grid);
}

// --- INIT LISTENER TIPE TRANSAKSI (IN/OUT/TRANSFER) ---
export function initTypeSelector() {
    const radios = document.querySelectorAll('input[name="b-type"]');
    radios.forEach(r => {
        r.addEventListener('change', (e) => {
            const newType = e.target.value;
            const catWrapper = document.getElementById('category-wrapper');
            const targetGroup = document.getElementById('target-wallet-group');
            const lblSource = document.getElementById('lbl-wallet-source');

            if (newType === 'transfer') {
                catWrapper.style.display = 'none';
                targetGroup.style.display = 'block';
                lblSource.style.display = 'block';
            } else {
                catWrapper.style.display = 'block';
                targetGroup.style.display = 'none';
                lblSource.style.display = 'none';
                
                const defaultCat = CATEGORIES[newType][0].id;
                document.getElementById('b-category').value = defaultCat;
                renderCategorySelector(newType);
            }
        });
    });
}

// --- INIT FILTER BULAN ---
export function initMonthFilter() {
    const select = document.getElementById('filter-month');
    if(!select) return;

    select.innerHTML = `<option value="all">${t('opt_all_time', data.settings.lang)}</option>`;

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const today = new Date();
    
    for (let i = -1; i < 12; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        
        const opt = document.createElement('option');
        opt.value = `${year}-${month}`;
        opt.textContent = `${monthNames[d.getMonth()]} ${year}`;
        if (i === 0) opt.selected = true;
        select.appendChild(opt);
    }
}

// --- RENDER BUDGET LIST ---
export function renderBudget() {
    const list = document.getElementById('budget-list');
    const searchInput = document.getElementById('budget-search');
    const filterMonth = document.getElementById('filter-month').value;
    const sortOrder = document.getElementById('filter-sort-budget').value;

    if(!list) return;
    list.innerHTML = '';
    
    let income = 0, expense = 0;
    let displayedData = [...data.budget];
    const keyword = searchInput ? searchInput.value.toLowerCase() : "";

    // Filter
    displayedData = displayedData.filter(b => {
        const matchesKeyword = b.desc.toLowerCase().includes(keyword);
        const matchesMonth = filterMonth === 'all' || b.date.startsWith(filterMonth);
        return matchesKeyword && matchesMonth;
    });

    // Sorting
    displayedData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Render
    displayedData.forEach(b => {
        if (b.type === 'income') income += b.amount; 
        else if (b.type === 'expense') expense += b.amount;
        
        let cat = null;
        let walletName = 'Dompet';
        
        // Cari Kategori
        const allCats = [...CATEGORIES.expense, ...CATEGORIES.income];
        if (b.categoryId) cat = allCats.find(c => c.id === b.categoryId);
  
        // Handle Transfer Display
        if (b.type === 'transfer') {
            cat = { name: t('lbl_transfer_type', data.settings.lang), icon: 'fa-exchange-alt', color: '#2e86de' };
            const targetW = data.wallets.find(w => w.id == b.targetWalletId);
            if(targetW) walletName += ` -> ${targetW.name}`;
        }
        
        // Fallback Category
        if (!cat) cat = { 
            nameKey: b.type === 'income' ? 'lbl_income_type' : 'lbl_expense_type', 
            icon: b.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up', 
            color: '#888' 
        };
        
        // Finalize Labels
        let catName = b.type === 'transfer' ? cat.name : (cat.nameKey ? t(cat.nameKey, data.settings.lang) : cat.name);
        let amountClass = 'text-red';
        let amountSign = '-';
        if (b.type === 'income') { amountClass = 'text-green'; amountSign = '+'; }
        else if (b.type === 'transfer') { amountClass = 'text-blue'; amountSign = ''; }

        const el = document.createElement('div');
        el.className = `card list-item`; 
        el.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="background:${cat.color}; width:40px; height:40px; border-radius:12px; display:grid; place-items:center; color:white; flex-shrink:0;">
                    <i class="fas ${cat.icon}"></i>
                </div>
                <div>
                    <strong>${b.desc}</strong><br>
                    <small class="text-muted">${fmtDate(b.date, data.settings.lang)} &bull; ${catName}</small>
                </div>
            </div>
            <div class="text-right">
                <strong class="${amountClass}">
                    ${amountSign} ${fmtMoney(b.amount)}
                </strong>
                 <div style="margin-top:5px; display:flex; gap:10px; justify-content:flex-end;">
                    <i class="fas fa-pen text-primary" onclick="editBudget(${b.id})" style="font-size:0.9rem; cursor:pointer;"></i>
                    <i class="fas fa-trash text-muted" onclick="deleteItem('budget', ${b.id})" style="font-size:0.9rem; cursor:pointer;"></i>
                </div>
            </div>
        `;
        list.appendChild(el);
    });
    
    // Update Dashboard Info
    document.getElementById('main-income').textContent = fmtMoney(income);
    document.getElementById('main-expense').textContent = fmtMoney(expense);
    
    renderChart(income, expense);

    if(displayedData.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;"><i class="fas fa-search" style="font-size:2rem; margin-bottom:10px;"></i><p>Tidak ditemukan</p></div>`;
    }
}

// --- CRUD BUDGET ---
export function saveBudget() {
    const id = document.getElementById('b-id').value; 
    const typeRadio = document.querySelector('input[name="b-type"]:checked');
    const type = typeRadio ? typeRadio.value : 'expense';

    const amount = parseMoney(document.getElementById('b-amount').value);
    const desc = document.getElementById('b-desc').value;
    const date = document.getElementById('b-date').value;
    const walletId = parseInt(document.getElementById('b-wallet').value);
    const categoryId = document.getElementById('b-category').value || 'others';
    const targetWalletId = parseInt(document.getElementById('b-wallet-target').value); 
    
    if (!amount || !desc) return showToast(t('msg_complete_data', data.settings.lang), 'error');
    if (type === 'transfer' && walletId === targetWalletId) return showToast(t('msg_same_wallet', data.settings.lang), 'error');

    if (id) {
        // Edit Mode
        const oldItem = data.budget.find(b => b.id == id);
        if (oldItem) {
            oldItem.type = type;
            oldItem.amount = amount;
            oldItem.desc = desc;
            oldItem.date = date;
            oldItem.walletId = walletId;
            
            if (type === 'transfer') {
                oldItem.targetWalletId = targetWalletId;
                oldItem.categoryId = null;
            } else {
                oldItem.targetWalletId = null;
                oldItem.categoryId = categoryId;
            }
            showToast("Transaksi berhasil diedit");
        }
    } else {
        // Create Mode
        data.budget.unshift({ 
            id: Date.now(), type, amount, desc, date, walletId, 
            categoryId: (type === 'transfer' ? null : categoryId), 
            targetWalletId: (type === 'transfer' ? targetWalletId : null) 
        });
        showToast(t('msg_trans_saved', data.settings.lang));
    }
    
    saveAppData(window.currentUser, window.dbInstance);
    closeModal('modal-budget');
    updateUI(); 
}

export function editBudget(id) {
    const item = data.budget.find(b => b.id === id);
    if (!item) return;

    document.getElementById('b-id').value = item.id;
    document.getElementById('b-amount').value = item.amount.toLocaleString('id-ID'); 
    document.getElementById('b-desc').value = item.desc;
    document.getElementById('b-date').value = item.date;
    if(item.walletId) document.getElementById('b-wallet').value = item.walletId;
    
    const catWrapper = document.getElementById('category-wrapper');
    const targetGroup = document.getElementById('target-wallet-group');
    const lblSource = document.getElementById('lbl-wallet-source');
    
    // Set Radio Type
    if (item.type === 'income') document.getElementById('t-in').checked = true;
    else if (item.type === 'transfer') document.getElementById('t-trans').checked = true;
    else document.getElementById('t-out').checked = true;

    // Toggle UI Inputs
    if (item.type === 'transfer') {
        catWrapper.style.display = 'none';
        targetGroup.style.display = 'block';
        lblSource.style.display = 'block';
        if(item.targetWalletId) document.getElementById('b-wallet-target').value = item.targetWalletId;
    } else {
        catWrapper.style.display = 'block';
        targetGroup.style.display = 'none';
        lblSource.style.display = 'none';
        document.getElementById('b-category').value = item.categoryId || (item.type === 'income' ? 'salary' : 'food');
        renderCategorySelector(item.type);
    }

    openModal('modal-budget');
}

// --- CHARTS ---
function renderChart(income, expense) {
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
                backgroundColor: ['#2563eb', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: { cutout: '75%', plugins: { legend: { position: 'bottom' } } }
    });
}

export function renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if(!ctx) return; 

    const labels = [];
    const dataPoints = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(d.toLocaleDateString(data.settings.lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: '2-digit' }));
        
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
                label: 'Expense',
                data: dataPoints,
                backgroundColor: 'rgba(239, 68, 68, 0.6)', 
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, ticks: { callback: function(value) { return (value / 1000).toLocaleString() + 'k'; } } } },
            plugins: { legend: { display: false } }
        }
    });
}
