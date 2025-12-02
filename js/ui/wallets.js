// Logika perhitungan dan tampilan dompet.

import { data, saveAppData } from '../db.js';
import { t, fmtMoney } from '../utils.js';

export function renderWallets() {
    const container = document.getElementById('wallet-list');
    const select = document.getElementById('b-wallet');
    const selectTarget = document.getElementById('b-wallet-target');

    if(!container || !select) return;

    // --- REKALKULASI SALDO ---
    // Reset saldo awal
    data.wallets.forEach(w => w.balance = 0);
    
    // Loop semua transaksi untuk update saldo
    data.budget.forEach(b => {
        // Sumber Dana
        const wSource = data.wallets.find(x => x.id == b.walletId);
        if (wSource) {
            if (b.type === 'income') wSource.balance += b.amount;
            else if (b.type === 'expense') wSource.balance -= b.amount;
            else if (b.type === 'transfer') wSource.balance -= b.amount; 
        }

        // Tujuan Dana (Transfer)
        if (b.type === 'transfer' && b.targetWalletId) {
            const wTarget = data.wallets.find(x => x.id == b.targetWalletId);
            if (wTarget) wTarget.balance += b.amount;
        }
    });

    // --- RENDER UI ---
    container.innerHTML = '';
    select.innerHTML = '';
    if (selectTarget) selectTarget.innerHTML = '';
    
    let globalTotal = 0;

    data.wallets.forEach(w => {
        globalTotal += w.balance;
        
        // Nama Tampilan
        let displayName = w.name;
        if (w.type === 'cash') displayName = t('wallet_cash', data.settings.lang);
        else if (w.type === 'bank') displayName = t('wallet_bank', data.settings.lang);
        else if (w.type === 'ewallet') displayName = t('wallet_ewallet', data.settings.lang);

        // Icon Tampilan
        let iconClass = 'fa-wallet';
        if(w.type === 'bank') iconClass = 'fa-university';
        if(w.type === 'ewallet') iconClass = 'fa-mobile-alt';

        // 1. Render Kartu Mini di Home
        const el = document.createElement('div');
        el.className = 'wallet-card-mini';
        el.innerHTML = `
            <div class="icon"><i class="fas ${iconClass}"></i></div>
            <small>${displayName}</small>
            <strong>${fmtMoney(w.balance)}</strong>
        `;
        container.appendChild(el);

        // 2. Render Dropdown Pilihan Dompet
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `${displayName} (${fmtMoney(w.balance)})`;
        select.appendChild(opt);

        // 3. Render Dropdown Target Transfer (Clone)
        if (selectTarget) {
            const optTarget = opt.cloneNode(true);
            selectTarget.appendChild(optTarget);
        }
    });
    
    // Update Total Saldo Utama
    document.getElementById('main-balance').textContent = fmtMoney(globalTotal);
    
    // Simpan saldo terbaru (cache) ke DB
    saveAppData(window.currentUser, window.dbInstance);
}
