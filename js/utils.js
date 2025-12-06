// js/utils.js
import { RESOURCES } from './resources.js';

export function t(key, lang = 'id') {
    return RESOURCES[lang][key] || key;
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

// [PENTING] Menerima parameter callbackCalc
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
            
            // Panggil callback jika input pinjaman berubah
            if(callbackCalc && (this.id === 'l-principal' || this.id === 'l-rate' || this.id === 'l-tenor')) {
                callbackCalc();
            }
        });
    });
}

// [TAMBAHAN KEAMANAN]
// Fungsi untuk mengubah PIN menjadi kode acak (Hash SHA-256)
export async function hashPin(pinString) {
    const msgBuffer = new TextEncoder().encode(pinString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
