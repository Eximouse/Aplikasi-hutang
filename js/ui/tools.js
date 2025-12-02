// Gabungan Kalkulator dan Dana Darurat.

import { data, saveAppData } from '../db.js';
import { t, fmtMoney, parseMoney } from '../utils.js';
import { showToast } from './core.js';
import { updateUI } from './index.js';
import { openModal, closeModal } from './nav.js';

// --- EMERGENCY FUND ---
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

// --- CALCULATOR ---
export function toggleDcaInput() {
    const method = document.getElementById('calc-method').value;
    const dcaGroup = document.getElementById('dca-input-group');
    if (dcaGroup) {
        if (method === 'none') dcaGroup.classList.add('hidden');
        else dcaGroup.classList.remove('hidden');
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
