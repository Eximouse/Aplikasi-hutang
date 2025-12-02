// Mengurus navigasi halaman, tab, dan modal.

import { t } from '../utils.js';
import { data } from '../db.js';
import { renderTrendChart } from './budget.js'; 

export function navTo(pageId) {
    // 1. Pindah Halaman
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    
    // 2. Update Navigasi Bawah
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
    
    // 3. Update Header Title
    const titleKeys = {
        'page-home': 'nav_home', 
        'page-budget': 'nav_budget', 
        'page-loans': 'nav_loans', 
        'page-tools': 'nav_tools', 
        'page-settings': 'nav_settings'
    };
    
    const headerEl = document.getElementById('header-title');
    if (headerEl) {
        const titleKey = titleKeys[pageId];
        headerEl.setAttribute('data-i18n', titleKey);
        headerEl.textContent = t(titleKey, data.settings.lang);
    }
    
    // 4. Atur FAB (Sembunyikan di Settings)
    const fab = document.querySelector('.fab-wrapper');
    if (fab) {
        fab.style.display = (pageId === 'page-settings') ? 'none' : 'flex';
    }   

    // 5. Render Chart jika ke Home (agar animasi jalan)
    if (pageId === 'page-home') {
        setTimeout(() => renderTrendChart(), 100);
    }
}

export function switchTab(context, tabId) {
    const parent = context === 'tools' ? document.getElementById('page-tools') : document.getElementById(`page-${context}`);
    if(!parent) return;

    parent.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none'; 
    });

    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block'; 
    }
    
    parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');
}

export function toggleFab() {
    document.getElementById('fab-menu').classList.toggle('active');
    const icon = document.getElementById('fab-icon');
    icon.classList.toggle('fa-plus');
    icon.classList.toggle('fa-times');
}

export function openModal(id) {
    document.getElementById(id).classList.add('active');
    if(document.getElementById('fab-menu').classList.contains('active')) toggleFab();
}

export function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    resetInputs(id);
}

function resetInputs(containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    // Reset Text Inputs
    container.querySelectorAll('input:not([type="radio"]):not([type="hidden"])').forEach(input => input.value = '');
    
    // Reset Date to Today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = container.querySelector('input[type="date"]');
    if(dateInput) dateInput.value = today;

    // Reset Specific Forms
    if(containerId === 'modal-budget') {
        const defaultRadio = document.getElementById('t-out');
        if(defaultRadio) defaultRadio.checked = true;
        document.getElementById('b-id').value = ''; 
    }
}
