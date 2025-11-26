// js/utils.js
import { RESOURCES } from './resources.js';

// Helper Terjemahan
export function t(key, lang) {
    // Kita butuh lang dipass dari luar (karena data ada di db.js)
    const currentLang = lang || 'id';
    return RESOURCES[currentLang][key] || key;
}

export function parseMoney(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    return parseInt(str.replace(/\./g, ''), 10);
}

export function fmtMoney(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

export function fmtDate(dateString, lang = 'id') {
    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    let formatted = date.toLocaleDateString(locale, options);
    
    if(lang === 'id') {
        formatted = formatted.replace(/\s/g, '-').replace('Tgl-', ''); 
    }
    return formatted;
}

// Inisialisasi Input Uang (Auto titik)
export function initMoneyInputs(callbackCalc) {
    const inputs = document.querySelectorAll('.money-input');
    inputs.forEach(input => {
        input.oninput = null; 
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value) {
                value = parseInt(value, 10).toLocaleString('id-ID');
                this.value = value;
            } else {
                this.value = '';
            }
            // Panggil callback jika ada (untuk kalkulator pinjaman)
            if(callbackCalc && (this.id === 'l-principal' || this.id === 'l-rate' || this.id === 'l-tenor')) {
                callbackCalc();
            }
        });
    });
}
