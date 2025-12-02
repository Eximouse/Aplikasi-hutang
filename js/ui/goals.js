// Logika target tabungan.

import { data, saveAppData } from '../db.js';
import { t, fmtMoney, parseMoney } from '../utils.js';
import { showToast } from './core.js';
import { updateUI, deleteItem } from './index.js';
import { openModal, closeModal } from './nav.js';

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
