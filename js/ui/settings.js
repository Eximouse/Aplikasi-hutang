// Bahasa, Tema, PIN, PDF, dan Backup.

import { data, saveAppData } from '../db.js';
import { t, fmtDate, fmtMoney } from '../utils.js';
import { showToast, showConfirmDialog } from './core.js';
import { updateUI } from './index.js';
import { openModal, closeModal } from './nav.js';
import { APP_KEY } from '../config.js';

// --- LANGUAGE ---
export function renderLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key, data.settings.lang);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        el.placeholder = t(key, data.settings.lang);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
        const key = el.getAttribute('data-i18n-label');
        el.setAttribute('data-label', t(key, data.settings.lang));
    });
    const labelLang = document.getElementById('current-lang-label');
    if(labelLang) {
        labelLang.textContent = data.settings.lang === 'id' ? 'Indonesia' : 'English';
    }
    updatePinButtonText();
}

export function openLangModal() {
    document.querySelectorAll('.lang-item').forEach(el => el.classList.remove('active'));
    document.getElementById('check-id').style.display = 'none';
    document.getElementById('check-en').style.display = 'none';
    const cur = data.settings.lang;
    if(cur === 'id') {
        document.getElementById('check-id').parentElement.classList.add('active');
        document.getElementById('check-id').style.display = 'block';
    } else {
        document.getElementById('check-en').parentElement.classList.add('active');
        document.getElementById('check-en').style.display = 'block';
    }
    openModal('modal-lang');
}

export function selectLang(langCode) {
    data.settings.lang = langCode;
    saveAppData(window.currentUser, window.dbInstance);
    updateUI();
    closeModal('modal-lang');
    showToast(langCode === 'id' ? "Bahasa diganti" : "Language changed");
}

// --- THEME ---
export function initTheme() {
    const theme = data.settings.theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-icon').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

export function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = current === 'light' ? 'dark' : 'light';
    data.settings.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    document.getElementById('theme-icon').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    saveAppData(window.currentUser, window.dbInstance);
}

// --- PIN SECURITY ---
let currentPinInput = "";
let isSettingUpPin = false;

export function checkPinLock() {
    const savedPin = data.settings.pin;
    const overlay = document.getElementById('pin-overlay');
    if (savedPin) {
        overlay.classList.remove('hidden');
        document.getElementById('pin-title').innerText = t('enter_pin', data.settings.lang);
        document.getElementById('btn-forgot-pin').style.display = 'inline-block';
        isSettingUpPin = false;
    } else {
        overlay.classList.add('hidden');
    }
}

export function pressPin(key) {
    const dots = document.querySelectorAll('.dot');
    if (key === 'c') {
        currentPinInput = currentPinInput.slice(0, -1);
    } else if (key === 'enter') {
        // optional
    } else {
        if (currentPinInput.length < 4) currentPinInput += key;
    }
    dots.forEach((dot, index) => {
        if (index < currentPinInput.length) dot.classList.add('filled');
        else dot.classList.remove('filled');
    });
    if (currentPinInput.length === 4) setTimeout(validatePin, 200);
}

function validatePin() {
    const savedPin = data.settings.pin;
    const dots = document.querySelectorAll('.dot');
    if (isSettingUpPin) {
        data.settings.pin = currentPinInput;
        saveAppData(window.currentUser, window.dbInstance);
        showToast(t('pin_set', data.settings.lang), "success");
        document.getElementById('pin-overlay').classList.add('hidden');
        currentPinInput = "";
        isSettingUpPin = false;
        updatePinButtonText();
    } else {
        if (currentPinInput === savedPin) {
            document.getElementById('pin-overlay').classList.add('hidden');
            currentPinInput = "";
        } else {
            dots.forEach(d => d.classList.add('error'));
            setTimeout(() => {
                dots.forEach(d => { d.classList.remove('error'); d.classList.remove('filled'); });
                currentPinInput = "";
            }, 400);
            showToast(t('pin_wrong', data.settings.lang), "error");
        }
    }
}

export function togglePinSetup() {
    const overlay = document.getElementById('pin-overlay');
    currentPinInput = "";
    if (data.settings.pin) {
        showConfirmDialog(t('confirm_disable_pin', data.settings.lang), function() {
            data.settings.pin = null;
            saveAppData(window.currentUser, window.dbInstance);
            showToast(t('pin_unset', data.settings.lang));
            updatePinButtonText();
        });
    } else {
        isSettingUpPin = true;
        overlay.classList.remove('hidden');
        document.getElementById('pin-title').innerText = t('setup_pin', data.settings.lang);
        document.getElementById('btn-forgot-pin').style.display = 'none';
        document.querySelectorAll('.dot').forEach(d => d.classList.remove('filled'));
    }
}

function updatePinButtonText() {
    const btn = document.getElementById('btn-toggle-pin');
    if(btn) {
        btn.innerText = data.settings.pin ? t('disable_pin', data.settings.lang) : t('enable_pin', data.settings.lang);
        if (data.settings.pin) btn.className = "btn-xs btn-toggle-inactive"; 
        else btn.className = "btn-xs btn-toggle-active";
    }
}

// --- BACKUP & RESTORE ---
export function downloadBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const date = new Date().toISOString().split('T')[0];
    downloadAnchorNode.setAttribute("download", `finpro_backup_${date}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

export function restoreBackup(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            if (json.budget && json.settings) {
                const msg = data.settings.lang === 'en' 
                    ? "Current data will be replaced with backup data. Continue?" 
                    : "Data saat ini akan ditimpa dengan data backup. Lanjutkan?";
                showConfirmDialog(msg, function() {
                    Object.assign(data, json);
                    saveAppData(window.currentUser, window.dbInstance);
                    alert("Restore Berhasil! Aplikasi akan dimuat ulang.");
                    location.reload();
                });
            } else {
                alert("File backup tidak valid!");
            }
        } catch (err) {
            alert("Error membaca file JSON!");
        }
    };
    reader.readAsText(file);
    input.value = ''; 
}

export function resetData() {
    showConfirmDialog(t('msg_confirm_reset', data.settings.lang), function() {
        localStorage.removeItem(APP_KEY);
        location.reload();
    });
}

// --- PDF & CSV ---
export function generatePDF() {
    if (!window.jspdf) {
        showToast("Library PDF belum siap. Coba refresh.", "error");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("Finansial Pro", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Laporan Keuangan Pribadi", 14, 26);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 32);

    const filterMonth = document.getElementById('filter-month') ? document.getElementById('filter-month').value : 'all';
    let reportData = data.budget.filter(b => filterMonth === 'all' || b.date.startsWith(filterMonth));

    let totalIncome = 0;
    let totalExpense = 0;
    reportData.forEach(b => {
        if (b.type === 'income') totalIncome += b.amount;
        else totalExpense += b.amount;
    });
    const balance = totalIncome - totalExpense;

    doc.setDrawColor(200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 40, 180, 25, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text("Pemasukan", 20, 48);
    doc.text("Pengeluaran", 80, 48);
    doc.text("Sisa Saldo", 140, 48);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); doc.text(fmtMoney(totalIncome), 20, 58);
    doc.setTextColor(239, 68, 68); doc.text(fmtMoney(totalExpense), 80, 58);
    doc.setTextColor(37, 99, 235); doc.text(fmtMoney(balance), 140, 58);

    const tableRows = reportData.map(b => {
        const wallet = data.wallets.find(w => w.id === b.walletId);
        return [fmtDate(b.date, data.settings.lang), b.desc, wallet ? wallet.name : '-', b.type === 'income' ? 'Masuk' : 'Keluar', fmtMoney(b.amount)];
    });

    doc.autoTable({
        startY: 75,
        head: [['Tanggal', 'Keterangan', 'Dompet', 'Tipe', 'Nominal']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } }
    });

    doc.save(`Laporan_Keuangan_${Date.now()}.pdf`);
    showToast("Laporan PDF berhasil diunduh!");
}

export function exportCSV(type) {
    let csvContent = "data:text/csv;charset=utf-8,";
    let rows = [];
    
    if(type === 'budget') {
        rows.push("Tanggal,Tipe,Deskripsi,Nominal,Dompet");
        data.budget.forEach(b => {
            const w = data.wallets.find(x => x.id === b.walletId)?.name || '-';
            rows.push(`${b.date},${b.type},"${b.desc}",${b.amount},"${w}"`);
        });
    } else if(type === 'loans') {
        rows.push("Tanggal,Tipe,Nama,Total,Terbayar,Status");
        data.loans.forEach(l => rows.push(`${l.date},${l.type},"${l.person}",${l.total},${l.paid},${l.status}`));
    }

    const encodedUri = encodeURI(csvContent + rows.join("\r\n"));
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finpro_${type}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
