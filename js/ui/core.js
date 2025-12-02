// Berisi konstanta, helper notifikasi, dan dialog konfirmasi.

import { data } from '../db.js';
import { t } from '../utils.js';

// --- DEFINISI KATEGORI ---
export const CATEGORIES = {
    expense: [
        { id: 'food', nameKey: 'cat_food', icon: 'fa-utensils', color: '#ff6b6b' },
        { id: 'transport', nameKey: 'cat_transport', icon: 'fa-bus', color: '#feca57' },
        { id: 'shop', nameKey: 'cat_shop', icon: 'fa-shopping-bag', color: '#54a0ff' },
        { id: 'bill', nameKey: 'cat_bill', icon: 'fa-file-invoice', color: '#ff9ff3' },
        { id: 'health', nameKey: 'cat_health', icon: 'fa-heartbeat', color: '#ff4d4d' },
        { id: 'educ', nameKey: 'cat_educ', icon: 'fa-book', color: '#48dbfb' },
        { id: 'ent', nameKey: 'cat_ent', icon: 'fa-gamepad', color: '#a55eea' },
        { id: 'others', nameKey: 'cat_others', icon: 'fa-ellipsis-h', color: '#8395a7' }
    ],
    income: [
        { id: 'salary', nameKey: 'cat_salary', icon: 'fa-money-bill-wave', color: '#1dd1a1' },
        { id: 'bonus', nameKey: 'cat_bonus', icon: 'fa-gift', color: '#f368e0' },
        { id: 'invest', nameKey: 'cat_invest', icon: 'fa-chart-line', color: '#2e86de' },
        { id: 'others-in', nameKey: 'cat_others_in', icon: 'fa-plus-circle', color: '#8395a7' }
    ]
};

// --- TOAST NOTIFICATION ---
export function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
    
    // Fallback styling jika CSS belum load sempurna
    toast.style.background = type === 'success' ? 'rgba(0, 176, 155, 0.95)' : 'rgba(252, 92, 125, 0.95)';
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- CONFIRM DIALOG ---
let onConfirmAction = null;

export function showConfirmDialog(message, actionCallback) {
    document.getElementById('confirm-msg').innerText = message;
    document.getElementById('confirm-title').innerText = t('lbl_confirm_title', data.settings.lang);
    document.getElementById('btn-conf-cancel').innerText = t('btn_cancel', data.settings.lang);
    document.getElementById('btn-conf-yes-text').innerText = t('btn_yes', data.settings.lang);
    
    onConfirmAction = actionCallback;
    document.getElementById('modal-confirm').classList.add('active');
}

export function setupConfirmListener() {
    const btn = document.getElementById('btn-conf-yes');
    if(btn) {
        btn.onclick = function() {
            if (onConfirmAction) onConfirmAction();
            document.getElementById('modal-confirm').classList.remove('active');
        };
    }
}
