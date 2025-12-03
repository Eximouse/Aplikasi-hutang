import { t } from '../utils.js';
import { data } from '../db.js';

// Hapus semua import lain yang mencurigakan

export function navTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
    
    // Update Header
    const titleKeys = {
        'page-home': 'nav_home', 
        'page-budget': 'nav_budget', 
        'page-loans': 'nav_loans', 
        'page-tools': 'nav_tools', 
        'page-settings': 'nav_settings'
    };
    
    const headerEl = document.getElementById('header-title');
    if(headerEl) {
        const titleKey = titleKeys[pageId];
        headerEl.setAttribute('data-i18n', titleKey);
        headerEl.textContent = t(titleKey, data.settings.lang);
    }
    
    // FAB
    const fab = document.querySelector('.fab-wrapper');
    if (fab) fab.style.display = (pageId === 'page-settings') ? 'none' : 'flex';

    // Chart - Gunakan try-catch agar tidak memblokir aplikasi jika error
    if (pageId === 'page-home') {
        setTimeout(() => {
            try {
                if(window.renderTrendChart) window.renderTrendChart();
            } catch(e) { console.warn("Chart belum siap"); }
        }, 100);
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
    if(target) {
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
    const modal = document.getElementById(id);
    if(modal) modal.classList.add('active');
    if(document.getElementById('fab-menu').classList.contains('active')) toggleFab();
}

export function closeModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.classList.remove('active');
    // Matikan resetInputs dulu jika menyebabkan error
    // resetInputs(id); 
}
