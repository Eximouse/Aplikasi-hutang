// AGGREGATOR / PENGHUBUNG SEMUA MODUL

import { data, saveAppData } from '../db.js';
import { t } from '../utils.js';
import { showToast, showConfirmDialog, setupConfirmListener, renderCategorySelector } from './core.js';
import { closeModal } from './nav.js';

import * as Nav from './nav.js';
import * as Wallets from './wallets.js';
import * as Budget from './budget.js';
import * as Bills from './bills.js';
import * as Goals from './goals.js';
import * as Loans from './loans.js';
import * as Tools from './tools.js';
import * as Settings from './settings.js';

// Fungsi Sentral Update UI
export function updateUI() {
    Settings.renderLanguage();
    Wallets.renderWallets(); 
    Budget.renderBudget();
    Bills.renderBills();
    Loans.renderLoans();
    Goals.renderGoals();
    Tools.renderEmergency();
    Budget.renderTrendChart();
}

// Fungsi Global Delete
export function deleteItem(collection, id) {
    showConfirmDialog(t('msg_confirm_del', data.settings.lang), function() {
        if (collection === 'budget') {
            const item = data.budget.find(x => x.id === id);
            if (item && item.walletId) {
                const w = data.wallets.find(w => w.id === item.walletId);
                if (w) {
                    if (item.type === 'income') w.balance -= item.amount;
                    else if (item.type === 'expense') w.balance += item.amount;
                    // Note: Untuk transfer logic delete lebih kompleks, 
                    // namun untuk MVP ini cukup mengembalikan saldo sumber.
                }
            }
        }
        data[collection] = data[collection].filter(x => x.id !== id);
        saveAppData(window.currentUser, window.dbInstance);
        updateUI(); 
        
        // Tutup modal detail jika sedang terbuka (misal detail hutang)
        if(document.getElementById('modal-detail').classList.contains('active')) {
            closeModal('modal-detail');
        }
        showToast("Item berhasil dihapus");
    });
}

// Ekspor semua agar bisa dipakai di main.js
export { 
    Nav, Wallets, Budget, Bills, Goals, Loans, Tools, Settings, 
    showToast, showConfirmDialog, setupConfirmListener, deleteItem, renderCategorySelector 
};
