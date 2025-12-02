//Logika tagihan rutin.

import { data, saveAppData } from '../db.js';
import { t, fmtMoney, parseMoney } from '../utils.js';
import { showToast } from './core.js';
import { updateUI, deleteItem } from './index.js';

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

export function toggleAddBill() {
    const form = document.getElementById('add-bill-form');
    if (form) form.classList.toggle('hidden');
}

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
    updateUI();
}

export function payBill(id) {
    const bill = data.bills.find(b => b.id === id);
    if(!bill) return;

    const defaultWalletId = 2; // Default Bank
    const wallet = data.wallets.find(w => w.id === defaultWalletId);
    if(wallet) wallet.balance -= bill.amount;

    data.budget.unshift({
        id: Date.now(),
        type: 'expense',
        amount: bill.amount,
        desc: `[Tagihan] ${bill.name}`,
        date: new Date().toISOString().split('T')[0],
        walletId: defaultWalletId
    });

    bill.lastPaidMonth = new Date().toISOString().slice(0, 7);

    saveAppData(window.currentUser, window.dbInstance);
    showToast(t('msg_bill_paid', data.settings.lang));
    updateUI();
}
