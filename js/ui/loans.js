// ​Logika hutang piutang.

import { data, saveAppData } from '../db.js';
import { t, fmtMoney, parseMoney, fmtDate, initMoneyInputs } from '../utils.js';
import { showToast, showConfirmDialog } from './core.js';
import { updateUI, deleteItem } from './index.js';
import { openModal, closeModal } from './nav.js';

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

    let processedLoans = data.loans.map(l => {
        let diffDays = 9999;
        let nextDueDateObj = null;

        if (l.status === 'active') {
            const remaining = l.total - l.paid;
            if(l.type === 'piutang') totPiutang += remaining; else totHutang += remaining;

            const transDate = new Date(l.date); transDate.setHours(0,0,0,0);
            const tenor = parseInt(l.tenor) || 1;
            const installmentAmount = l.total / tenor;
            let monthsPaid = Math.floor((l.paid + 100) / installmentAmount); 
            if (monthsPaid >= tenor) monthsPaid = tenor - 1;

            let nextDueDate = new Date(transDate);
            nextDueDate.setMonth(transDate.getMonth() + (monthsPaid + 1));
            nextDueDateObj = nextDueDate;

            const diffTime = nextDueDate - today;
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return { ...l, diffDays, nextDueDateObj };
    });

    processedLoans.sort((a, b) => {
        if (sortOrder === 'closest') return a.diffDays - b.diffDays;
        else if (sortOrder === 'furthest') return b.diffDays - a.diffDays;
        else return b.id - a.id;
    });

    processedLoans.forEach(l => {
        if(!l.person.toLowerCase().includes(search)) return;

        let dueStatusHTML = '';
        let progressLabel = ''; 

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
        const tenorVal = parseInt(l.tenor) || 1;
        const monthlyBill = l.total / tenorVal;

        const el = document.createElement('div');
        el.className = 'card list-item';
        el.style.padding = '15px'; 
        el.style.borderLeft = `4px solid ${l.type === 'piutang' ? 'var(--success)' : 'var(--danger)'}`;
        
        el.innerHTML = `
            <div onclick="showLoanDetail(${l.id})" style="width:100%">
                <div class="flex-between" style="margin-bottom:8px;">
                    <strong style="font-size:1rem;">${l.person}</strong>
                    <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px; color:${l.type==='piutang'?'var(--success)':'var(--danger)'}">${typeLabel}</span>
                </div>
                <div class="flex-between" style="margin-bottom:12px;">
                    <div>${dueStatusHTML}</div>
                    <small class="text-muted" style="font-size:0.75rem;">${l.status === 'active' ? progressLabel : displayTenor}</small>
                </div>
                <div style="background:var(--bg-input); border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div><small class="text-muted" style="font-size:0.65rem; display:block; margin-bottom:2px;">Cicilan/bln</small><strong style="font-size:0.9rem; color:var(--text-main)">${fmtMoney(monthlyBill)}</strong></div>
                    <div style="text-align:right"><small class="text-muted" style="font-size:0.65rem; display:block; margin-bottom:2px;">${remainingLabel}</small><strong style="font-size:0.9rem; color:${l.type==='piutang'?'var(--success)':'var(--danger)'}">${fmtMoney(l.total - l.paid)}</strong></div>
                </div>
                <div class="goal-progress-bg" style="height:6px; margin-top:0;">
                    <div class="goal-progress-bar" style="width:${progress}%; background:${l.type==='piutang'?'var(--success)':'var(--danger)'}"></div>
                </div>
            </div>
        `;
        if(l.status === 'active') activeList.appendChild(el); else historyList.appendChild(el);
    });

    document.getElementById('main-piutang').textContent = fmtMoney(totPiutang);
    document.getElementById('main-hutang').textContent = fmtMoney(totHutang);
}

export function showLoanDetail(id) {
    const l = data.loans.find(x => x.id === id);
    if (!l) return; 
    const remaining = l.total - l.paid;
    const typeLabel = l.type === 'piutang' ? t('word_receivable', data.settings.lang) : t('word_debt', data.settings.lang);
    const tenorVal = parseInt(l.tenor) || 1;
    const monthlyBill = l.total / tenorVal;
    
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
        <div class="text-center mb-20" style="background:var(--bg-input); padding:10px; border-radius:12px;">
            <small class="text-muted">Periode Cicilan (${l.tenor} Bulan):</small><br>
            <strong style="color:var(--primary); font-size:1.1rem;">${fmtMoney(monthlyBill)} / bulan</strong>
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
