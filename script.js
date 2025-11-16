// -----------------------------------
// Catatan Keuangan: Hutang & Piutang Tracker (REVISI)
// -----------------------------------

let transactions = [];

// DOM ELEMENTS (Menggunakan const untuk elemen statis)
const form = document.getElementById('transactionForm');
const piutangListContainer = document.getElementById('piutangList');
const utangListContainer = document.getElementById('utangList');
const historyListContainer = document.getElementById('historyList'); 

const menuToggle = document.getElementById('menuToggle');
const sideMenuModal = document.getElementById('sideMenuModal');
const sideMenuContent = document.getElementById('sideMenuContent');
const menuItems = document.querySelectorAll('#sideMenuModal .menu-item');

const principalInput = document.getElementById('principal');
const interestRateInput = document.getElementById('interestRate');
const installmentsCountInput = document.getElementById('installmentsCount');
const startDateInput = document.getElementById('startDate'); 
const finalDueDateDisplay = document.getElementById('finalDueDateDisplay'); 
const estimateDiv = document.getElementById('installmentEstimate');
const fab = document.getElementById('fabAddTransaction'); 

let piutangChartInstance = null; 

// ===================================
// 1. MANAJEMEN DATA & LOCAL STORAGE
// ===================================

const loadTransactions = () => {
    const storedTransactions = localStorage.getItem('personalFinanceTracker');
    if (storedTransactions) {
        try {
            transactions = JSON.parse(storedTransactions); 
            // Pastikan paymentHistory selalu berupa array
            transactions.forEach(tx => {
                if (!tx.paymentHistory) tx.paymentHistory = [];
            });
        } catch (e) {
            console.error("Gagal memuat data dari Local Storage:", e);
            transactions = []; 
        }
    }
};

const saveTransactions = () => {
    localStorage.setItem('personalFinanceTracker', JSON.stringify(transactions));
};

// ===================================
// 2. FUNGSI UTILITAS
// ===================================

// Menggunakan Intl.NumberFormat untuk Rupiah
const formatInputRupiah = (inputElement) => {
    let angka = inputElement.value.replace(/\D/g, ''); 
    if (!angka || angka === '0') {
        inputElement.value = '';
        return;
    }
    inputElement.value = new Intl.NumberFormat('id-ID').format(angka);
};

const formatCurrency = (amount) => {
    const roundedAmount = Math.round(parseFloat(amount) || 0); 
    return roundedAmount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const cleanInterestRate = (input) => {
    // Memperbolehkan koma dan titik, lalu menstandarkan ke titik
    return String(input || '0').replace(/,/g, '.').replace(/[^0-9.]/g, ''); 
};

const cleanPrincipal = (input) => {
     // Menghapus titik dan koma (format ribuan Rupiah)
     return String(input || '0').replace(/\./g, '').replace(/,/g, '').replace(/[^0-9]/g, ''); 
};

const calculateTotal = (principal, rate, installmentsCount) => {
    const principalAmount = parseFloat(cleanPrincipal(principal) || 0); 
    const interestRate = parseFloat(cleanInterestRate(rate) || 0) / 100; 
    const installments = parseInt(installmentsCount || 0);
    
    if (isNaN(principalAmount) || isNaN(interestRate) || isNaN(installments) || installments === 0) {
        return { totalInterest: 0, totalAmount: 0, totalPerInstallment: 0 };
    }
    
    // Gunakan Math.round() untuk totalInterest dan totalPerInstallment agar lebih akurat dalam konteks Rupiah
    const totalInterest = Math.round(principalAmount * interestRate * installments);
    const totalAmount = principalAmount + totalInterest;
    const totalPerInstallment = Math.round(totalAmount / installments);
    
    return {
        totalInterest: totalInterest,
        totalAmount: totalAmount,
        totalPerInstallment: totalPerInstallment,
    };
};

const getFinancialTotals = () => {
    let totals = {
        totalPiutangAwal: 0, sisaPiutang: 0,      
        totalUtangAwal: 0, totalUtang: 0, sisaUtang: 0,        
        piutangAktif: 0, piutangLunas: 0, utangAktif: 0, utangLunas: 0
    };

    transactions.forEach(tx => { 
        const result = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount);
        const paidCount = tx.paymentHistory ? tx.paymentHistory.length : 0;
        const remainingInstallments = tx.installmentsCount - paidCount;
        
        // Menggunakan totalPerInstallment yang sudah dibulatkan untuk sisa
        const remainingTotal = result.totalPerInstallment * remainingInstallments; 

        if (tx.type === 'piutang') {
            totals.totalPiutangAwal += result.totalAmount;
            if (tx.status === 'aktif') {
                totals.sisaPiutang += remainingTotal;
                totals.piutangAktif += remainingTotal; 
            } else {
                totals.piutangLunas += result.totalAmount; 
            }
        } else if (tx.type === 'utang') {
            totals.totalUtangAwal += result.totalAmount;
            if (tx.status === 'aktif') {
                totals.sisaUtang += remainingTotal;
                totals.utangAktif += remainingTotal; 
            } else {
                totals.utangLunas += result.totalAmount; 
            }
        }
    });
    
    totals.netWorthAwal = totals.totalPiutangAwal - totals.totalUtangAwal;
    totals.netWorthAkhir = totals.sisaPiutang - totals.sisaUtang;
    
    return totals;
};

const updateInstallmentEstimate = () => {
    const principalClean = cleanPrincipal(principalInput.value); 
    const rateClean = cleanInterestRate(interestRateInput.value); 
    const installments = parseInt(installmentsCountInput.value);

    if (!principalClean || principalClean <= 0 || !rateClean || installments < 1) {
        estimateDiv.style.display = 'none';
        return;
    }

    const result = calculateTotal(principalClean, rateClean, installments);

    if (result.totalPerInstallment > 0) {
        estimateDiv.style.display = 'block';
        estimateDiv.innerHTML = `
            <p style="margin: 0; font-size: 0.95em; color:var(--primary-dark);">
                Estimasi Cicilan per Bulan (${installments}x): 
                <strong style="font-size: 1.1em;">Rp ${formatCurrency(result.totalPerInstallment)}</strong>
                <span style="font-size: 0.8em; color: var(--text-muted);">(Total akhir: Rp ${formatCurrency(result.totalAmount)})</span>
            </p>
        `;
    } else {
         estimateDiv.style.display = 'none';
    }
};

const calculateDueDate = () => {
    const startDateValue = startDateInput.value;
    const installments = parseInt(installmentsCountInput.value);
    
    if (!startDateValue || installments < 1 || isNaN(installments)) {
        finalDueDateDisplay.textContent = 'Pilih tanggal mulai dan tenor/cicilan.';
        return '';
    }

    // Pastikan tanggal diproses sebagai lokal
    const startDate = new Date(startDateValue + 'T00:00:00'); 
    if (isNaN(startDate.getTime())) { 
        finalDueDateDisplay.textContent = 'Tanggal mulai tidak valid.';
        return '';
    }
    
    const startDay = startDate.getDate();
    const finalDueDate = new Date(startDate);
    
    // setMonth akan menghitung bulan ke (Mulai + installments)
    finalDueDate.setMonth(finalDueDate.getMonth() + installments); 
    
    // Koreksi tanggal jika terjadi rollover
    // Jika hari bulan terakhir berbeda dengan hari mulai, berarti terjadi rollover (misal 31 Jan -> 3 Mar)
    if (finalDueDate.getDate() !== startDay) {
        finalDueDate.setDate(0); // Mundur ke hari terakhir bulan sebelumnya (misal 28 Feb)
    }

    const formattedDate = finalDueDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    
    finalDueDateDisplay.textContent = formattedDate;
    
    return finalDueDate.toISOString().split('T')[0];
};

const calculateNextDueDate = (tx) => {
     const dateString = tx.startDate;
     
     if (tx.status !== 'aktif' || !dateString) return null;

     const paidCount = tx.paymentHistory ? tx.paymentHistory.length : 0;
     if (paidCount >= tx.installmentsCount) return null; 

     // Pastikan tanggal diproses sebagai lokal
     const startDate = new Date(dateString + 'T00:00:00'); 
     if (isNaN(startDate.getTime())) return null; 

     const startDay = startDate.getDate();
     const nextDueDate = new Date(startDate);
     
     // Jatuh tempo cicilan berikutnya adalah: Bulan Mulai + (Cicilan yang sudah dibayar + 1)
     nextDueDate.setMonth(nextDueDate.getMonth() + paidCount + 1); 

     // Koreksi tanggal jika terjadi rollover
     if (nextDueDate.getDate() !== startDay) {
        nextDueDate.setDate(0); 
     }
     
     return nextDueDate.toISOString().split('T')[0]; 
};

const getDueStatus = (dueDate) => {
    if (!dueDate) return { badge: '', class: '' }; 

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const due = new Date(dueDate + 'T00:00:00'); // Penting untuk konsistensi zona waktu
    due.setHours(0, 0, 0, 0); 
    
    if (isNaN(due.getTime())) return { badge: 'TANGGAL ERROR', class: 'status-late' }; 

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return { badge: `TERLAMBAT ${Math.abs(diffDays)} hari`, class: 'status-late' };
    } else if (diffDays <= 7) {
        return { badge: `JATUH TEMPO ${diffDays} hari lagi`, class: 'status-warning' }; // Mengubah class untuk warning
    } else {
        return { badge: 'AKTIF', class: 'status-active' };
    }
};

// ===================================
// 3. FUNGSI RENDER 
// ===================================

const renderSummaryCards = () => {
    const totals = getFinancialTotals();
    const mainDashboard = document.getElementById('mainDashboard');
    
    if (!mainDashboard) return;

    mainDashboard.innerHTML = `
        <div class="summary-card card-piutang">
            <h3>Sisa Piutang Aktif</h3>
            <p>Rp ${formatCurrency(totals.sisaPiutang)}</p>
        </div>
        <div class="summary-card card-utang">
            <h3>Sisa Utang Aktif</h3>
            <p>Rp ${formatCurrency(totals.sisaUtang)}</p>
        </div>
        <div class="summary-card card-networth">
            <h3>Net Worth (Bersih)</h3>
            <p style="color: ${totals.netWorthAkhir >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">Rp ${formatCurrency(totals.netWorthAkhir)}</p>
        </div>
    `;

    // Update Summary Page
    document.getElementById('summaryPiutangAwal').textContent = `Rp ${formatCurrency(totals.totalPiutangAwal)}`;
    document.getElementById('summaryPiutangSisa').textContent = `Rp ${formatCurrency(totals.sisaPiutang)}`;
    document.getElementById('summaryUtangAwal').textContent = `Rp ${formatCurrency(totals.totalUtangAwal)}`;
    document.getElementById('summaryUtangSisa').textContent = `Rp ${formatCurrency(totals.sisaUtang)}`;
    document.getElementById('summaryNetWorth').textContent = `Rp ${formatCurrency(totals.netWorthAkhir)}`;
    document.getElementById('summaryNetWorth').style.color = totals.netWorthAkhir >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
};

const sortTransactions = (a, b, sortValue) => {
    const remainingA = calculateRemainingAmount(a);
    const remainingB = calculateRemainingAmount(b);
    
    switch (sortValue) {
        case 'due_asc':
            const nextDueA = calculateNextDueDate(a) || '9999-12-31';
            const nextDueB = calculateNextDueDate(b) || '9999-12-31';
            return nextDueA.localeCompare(nextDueB);
        case 'due_desc':
            const nextDueA_rev = calculateNextDueDate(a) || '0000-01-01';
            const nextDueB_rev = calculateNextDueDate(b) || '0000-01-01';
            return nextDueB_rev.localeCompare(nextDueA_rev);
        case 'amount_desc':
            return remainingB - remainingA;
        case 'lunas_desc':
            const dateA = a.dateCompleted || '0000-01-01';
            const dateB = b.dateCompleted || '0000-01-01';
            return dateB.localeCompare(dateA);
        case 'principal_desc':
             return parseFloat(cleanPrincipal(b.principal)) - parseFloat(cleanPrincipal(a.principal));
        default:
            return 0;
    }
};

const calculateRemainingAmount = (tx) => {
    const totals = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount);
    const paidCount = tx.paymentHistory ? tx.paymentHistory.length : 0;
    const remainingInstallments = tx.installmentsCount - paidCount;
    return totals.totalPerInstallment * remainingInstallments;
}

const renderTransactionList = (type, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let filteredList;
    if (type === 'history') {
         filteredList = transactions.filter(tx => tx.status === 'lunas');
    } else {
         filteredList = transactions.filter(tx => tx.type === type && tx.status === 'aktif');
    }
    
    // Search
    const searchInput = document.getElementById(`search${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const searchQuery = searchInput?.value.toLowerCase() || '';
    if (searchQuery) {
        filteredList = filteredList.filter(tx => tx.person.toLowerCase().includes(searchQuery));
    }
    
    // Sorting
    const sortValue = document.getElementById(`sort${type.charAt(0).toUpperCase() + type.slice(1)}`)?.value;
    if (sortValue) {
        filteredList.sort((a, b) => sortTransactions(a, b, sortValue));
    } else if (type === 'history') {
        filteredList.sort((a, b) => new Date(b.dateCompleted || '0000-01-01') - new Date(a.dateCompleted || '0000-01-01')); 
    } else {
         // Default sorting: jatuh tempo terdekat
         filteredList.sort((a, b) => sortTransactions(a, b, 'due_asc'));
    }


    if (filteredList.length === 0) {
         container.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 20px;">Tidak ada ${type} ${type === 'history' ? 'yang lunas' : 'aktif'} yang tercatat.</p>`;
         return;
    }

    let listHtml = filteredList.map(tx => {
        const nextDueDate = calculateNextDueDate(tx);
        const dueStatus = getDueStatus(nextDueDate);
        const totals = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount);
        const paidCount = tx.paymentHistory ? tx.paymentHistory.length : 0;
        const remainingInstallments = tx.installmentsCount - paidCount;
        const remainingTotal = totals.totalPerInstallment * remainingInstallments;
        
        const initials = tx.person.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        let amountDisplay, dueInfo, badge;

        if (tx.status === 'aktif') {
            amountDisplay = `<div class="remaining-amount">Rp ${formatCurrency(remainingTotal)}</div>`;
            dueInfo = `<div class="due-info">Cicilan ke ${paidCount + 1} (${tx.installmentsCount}x)</div>
                       <div class="due-info">Jatuh Tempo: ${nextDueDate ? new Date(nextDueDate + 'T00:00:00').toLocaleDateString('id-ID') : '-'}</div>`;
            badge = `<span class="status-badge ${dueStatus.class}">${dueStatus.badge}</span>`;
        } else { // Lunas
            amountDisplay = `<div class="remaining-amount" style="color:var(--success-color);">LUNAS</div>`;
            dueInfo = `<div class="due-info">Pokok: Rp ${formatCurrency(tx.principal)}</div>
                       <div class="due-info">Lunas: ${tx.dateCompleted ? new Date(tx.dateCompleted + 'T00:00:00').toLocaleDateString('id-ID') : '-'}</div>`;
            badge = `<span class="status-badge status-done">SELESAI</span>`; // Menggunakan class baru status-done
        }
        
        return `
            <div class="transaction-list-item ${tx.type}" data-id="${tx.id}" onclick="showDetailModal('${tx.id}')">
                <div class="avatar-icon">${initials}</div>
                <div class="info-section">
                    <strong>${tx.person}</strong>
                    <p style="margin: 3px 0 0;">${tx.type === 'piutang' ? 'MEMBERI PINJAMAN' : 'MENERIMA PINJAMAN'}</p>
                    ${badge}
                </div>
                <div class="amount-section">
                    ${amountDisplay}
                    ${dueInfo}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = listHtml;
};

const renderLatestTransactions = () => {
    const latestContainer = document.getElementById('latestTransactions');
    if (!latestContainer) return;

    let activeList = transactions.filter(tx => tx.status === 'aktif');
    
    // Sort by next due date (ascending)
    activeList.sort((a, b) => sortTransactions(a, b, 'due_asc'));
    
    const limitedList = activeList.slice(0, 5); 

    if (limitedList.length === 0) {
         latestContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 20px;">Tidak ada transaksi aktif.</p>`;
         return;
    }
    
    let listHtml = limitedList.map(tx => {
        const nextDueDate = calculateNextDueDate(tx);
        const dueStatus = getDueStatus(nextDueDate);
        const totals = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount);
        const paidCount = tx.paymentHistory ? tx.paymentHistory.length : 0;
        const remainingTotal = calculateRemainingAmount(tx);
        
        const initials = tx.person.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        return `
            <div class="transaction-list-item ${tx.type}" data-id="${tx.id}" onclick="showDetailModal('${tx.id}')">
                <div class="avatar-icon">${initials}</div>
                <div class="info-section">
                    <strong>${tx.person}</strong>
                    <p style="margin: 3px 0 0; font-size: 0.9em;">
                       ${tx.type === 'piutang' ? 'Piutang' : 'Utang'} | Cicilan ${paidCount + 1} dari ${tx.installmentsCount}
                    </p>
                    <span class="status-badge ${dueStatus.class}" style="margin-top: 5px;">${dueStatus.badge}</span>
                </div>
                <div class="amount-section">
                    <div class="remaining-amount" style="color: ${tx.type === 'piutang' ? 'var(--success-color)' : 'var(--danger-color)'};">Rp ${formatCurrency(remainingTotal)}</div>
                    <div class="due-info">Jatuh Tempo: ${nextDueDate ? new Date(nextDueDate + 'T00:00:00').toLocaleDateString('id-ID') : '-'}</div>
                </div>
            </div>
        `;
    }).join('');
    
    latestContainer.innerHTML = listHtml;
};

const renderChart = () => {
    const totals = getFinancialTotals();
    const ctx = document.getElementById('piutangChart')?.getContext('2d');
    
    if (!ctx) return; 

    if (piutangChartInstance) {
        piutangChartInstance.destroy();
    }
    
    // Cek apakah ChartDataLabels tersedia secara global
    const pluginsArray = (typeof ChartDataLabels !== 'undefined' && ChartDataLabels.id) ? [ChartDataLabels] : [];

    const chartData = {
        labels: ['Piutang Aktif', 'Utang Aktif', 'Piutang Lunas', 'Utang Lunas'],
        datasets: [{
            data: [totals.piutangAktif, totals.utangAktif, totals.piutangLunas, totals.utangLunas],
            backgroundColor: [
                '#4CAF50', // Piutang Aktif (Hijau Primer)
                '#F44336', // Utang Aktif (Merah Danger)
                '#81C784', // Piutang Lunas (Hijau Lebih Muda)
                '#EF9A9A'  // Utang Lunas (Merah Lebih Muda)
            ],
            hoverOffset: 10
        }]
    };

    piutangChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += 'Rp ' + formatCurrency(context.parsed);
                            }
                            return label;
                        }
                    }
                },
                datalabels: {
                    formatter: (value, context) => {
                        if (value === 0) return '';
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        // Sembunyikan label jika porsinya sangat kecil
                        if (total === 0 || (value / total) < 0.05) return ''; 
                        return 'Rp ' + formatCurrency(value);
                    },
                    color: '#fff',
                    font: { weight: 'bold', size: 10 }
                }
            }
        },
        plugins: pluginsArray 
    });
};

// ===================================
// 4. FUNGSI NAVIGASI & INTERAKSI
// ===================================

const navigateTo = (pageId) => {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if(targetPage) {
        targetPage.classList.add('active');
    }
    
    document.querySelectorAll('#sideMenuContent .menu-item').forEach(item => {
         item.classList.remove('active');
         if (item.getAttribute('data-page') === pageId) {
             item.classList.add('active');
         }
    });

    if (pageId === 'formPage') {
        fab.classList.remove('show');
    } else {
        fab.classList.add('show');
    }

    // Hanya re-render halaman yang dituju
    if (pageId === 'homePage') {
        renderSummaryCards();
        renderLatestTransactions();
        renderChart();
    } else if (pageId === 'piutangPage') {
         renderTransactionList('piutang', 'piutangList');
    } else if (pageId === 'utangPage') {
         renderTransactionList('utang', 'utangList');
    } else if (pageId === 'historyPage') {
         renderTransactionList('history', 'historyList');
    } else if (pageId === 'summaryPage') {
        renderSummaryCards(); 
    } else if (pageId === 'formPage') {
         // Reset form saat masuk halaman form
         form.reset();
         finalDueDateDisplay.textContent = 'Pilih tanggal mulai dan tenor/cicilan.';
         estimateDiv.style.display = 'none';
    }
    
    closeSideMenu();
    
    // Update URL Hash untuk navigasi & history
    history.pushState({page: pageId}, pageId, `#${pageId}`);
};

const filterTransactionList = (type) => {
     renderTransactionList(type, `${type}List`);
};

const openSideMenu = () => {
    sideMenuModal.style.display = 'block';
    setTimeout(() => {
        sideMenuContent.style.transform = 'translateX(0)';
    }, 10);
};

const closeSideMenu = () => {
    sideMenuContent.style.transform = 'translateX(-100%)';
    setTimeout(() => {
        sideMenuModal.style.display = 'none';
    }, 300);
};

// ===================================
// 5. FUNGSI FORM & MODAL 
// ===================================

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const principalClean = cleanPrincipal(principalInput.value);
    const rateClean = cleanInterestRate(interestRateInput.value); 
    const installments = parseInt(installmentsCountInput.value);
    const finalDueDate = calculateDueDate(); // Hanya untuk display/info, tidak disimpan

    if (parseFloat(principalClean) <= 0 || parseFloat(rateClean) < 0 || installments <= 0) {
        alert('Jumlah Pokok (>0), Suku Bunga (>=0), dan Cicilan (>0) harus diisi dengan benar.');
        return;
    }
    
    if (!document.getElementById('startDate').value) {
        alert('Tanggal Mulai Pinjam harus diisi.');
        return;
    }

    const newTransaction = {
        id: Date.now().toString(),
        type: document.getElementById('type').value,
        person: document.getElementById('person').value.trim(),
        principal: principalClean, // Simpan dalam format bersih
        startDate: document.getElementById('startDate').value,
        interestRate: rateClean, // Simpan dalam format bersih
        installmentsCount: installments,
        status: 'aktif',
        dateCompleted: null,
        paymentHistory: []
    };

    transactions.unshift(newTransaction);
    saveTransactions();
    
    alert('Transaksi berhasil dicatat!'); 
    
    // Reset form dan navigasi ke beranda
    form.reset();
    finalDueDateDisplay.textContent = 'Pilih tanggal mulai dan tenor/cicilan.';
    estimateDiv.style.display = 'none';
    
    reRenderAllLists(); 
    navigateTo('homePage'); 
});

const showDetailModal = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const modal = document.getElementById('transactionDetailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalActions = document.getElementById('modalActions');
    
    const totals = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount);
    const paidCount = tx.paymentHistory ? tx.paymentHistory.length : 0;
    const remainingInstallments = tx.installmentsCount - paidCount;
    const remainingTotal = totals.totalPerInstallment * remainingInstallments;
    const nextDueDate = calculateNextDueDate(tx);

    modalTitle.textContent = `${tx.type === 'piutang' ? 'Piutang' : 'Utang'} dengan ${tx.person}`;
    
    // Urutkan riwayat pembayaran berdasarkan tanggal secara ASC untuk penomoran cicilan
    const sortedHistoryForNumbering = tx.paymentHistory.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Urutkan riwayat pembayaran secara DESC untuk tampilan
    const sortedHistoryForDisplay = sortedHistoryForNumbering.slice().reverse();

    let historyHtml = sortedHistoryForDisplay.length > 0
        ? sortedHistoryForDisplay.map((p, index) => {
            // Cari nomor urut pembayaran di list yang sudah diurutkan berdasarkan waktu (ASC)
            const paymentIndexInTimeOrder = sortedHistoryForNumbering.findIndex(item => item.date === p.date && item.amount === p.amount) + 1;
            
            const isLatest = index === 0; // Pembayaran terbaru (di list DESC)
            const deleteButton = isLatest && tx.status === 'aktif'
                ? `<span style="color: var(--danger-color); cursor: pointer; font-size: 0.9em; margin-left: 10px;" onclick="cancelLastPayment('${tx.id}')"> [Batalkan]</span>`
                : '';

            return `
                <div>
                    <span>Cicilan ke-${paymentIndexInTimeOrder} (${new Date(p.date + 'T00:00:00').toLocaleDateString('id-ID')})</span>
                    <strong>Rp ${formatCurrency(p.amount)}${deleteButton}</strong>
                </div>
            `;
          }).join('')
        : '<p style="text-align: center; font-size: 0.9em; color: var(--text-muted);">Belum ada riwayat pembayaran.</p>';

    modalContent.innerHTML = `
        <div class="modal-detail-row"><span>Status:</span> <strong>${tx.status.toUpperCase()}</strong></div>
        <div class="modal-detail-row"><span>Pokok Pinjaman:</span> <strong>Rp ${formatCurrency(tx.principal)}</strong></div>
        <div class="modal-detail-row"><span>Total dengan Bunga (${tx.interestRate}%):</span> <strong>Rp ${formatCurrency(totals.totalAmount)}</strong></div>
        <div class="modal-detail-row"><span>Tenor/Cicilan:</span> <strong>${tx.installmentsCount} Bulan</strong></div>
        <div class="modal-detail-row"><span>Cicilan per Bulan:</span> <strong>Rp ${formatCurrency(totals.totalPerInstallment)}</strong></div>
        <hr style="margin: 10px 0;">
        <div class="modal-detail-row final-summary" style="color: ${tx.type === 'piutang' ? 'var(--success-color)' : 'var(--danger-color)'};">
            <span>Sisa Total:</span> <strong>Rp ${formatCurrency(remainingTotal)}</strong>
        </div>
        ${tx.status === 'aktif' ? `
            <div class="modal-detail-row"><span>Sisa Cicilan:</span> <strong>${remainingInstallments} dari ${tx.installmentsCount}</strong></div>
            <div class="modal-detail-row"><span>Jatuh Tempo Cicilan Berikut:</span> <strong>${nextDueDate ? new Date(nextDueDate + 'T00:00:00').toLocaleDateString('id-ID') : '-'}</strong></div>
        ` : ''}
        
        <h3>Riwayat Pembayaran (${paidCount}x)</h3>
        <div class="payment-history-list">${historyHtml}</div>
    `;

    modalActions.innerHTML = '';
    if (tx.status === 'aktif') {
        if (remainingInstallments > 0) {
             modalActions.innerHTML += `<button style="background-color: var(--success-color);" onclick="recordPaymentWithDate('${tx.id}', ${totals.totalPerInstallment})">Catat Pembayaran Cicilan (Rp ${formatCurrency(totals.totalPerInstallment)})</button>`;
        }
        modalActions.innerHTML += `<button style="background-color: var(--danger-color);" onclick="deleteTransaction('${tx.id}')">Hapus Transaksi</button>`;
    } else {
         modalActions.innerHTML += `<p style="text-align: center; color: var(--success-color); font-weight: bold;">Transaksi ini sudah LUNAS.</p>`;
         modalActions.innerHTML += `<button style="background-color: var(--danger-color);" onclick="deleteTransaction('${tx.id}')">Hapus Transaksi (Riwayat)</button>`;
    }
    
    modal.style.display = 'block';
};

const closeDetailModal = () => {
    document.getElementById('transactionDetailModal').style.display = 'none';
};

const recordPaymentWithDate = (id, installmentAmount) => {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = prompt(`Masukkan tanggal pembayaran untuk cicilan sebesar Rp ${formatCurrency(installmentAmount)} (YYYY-MM-DD):`, today);

    if (dateInput === null || dateInput.trim() === '') return; 
    
    // Validasi format tanggal
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput) || isNaN(new Date(dateInput + 'T00:00:00').getTime())) {
        alert('Format tanggal tidak valid. Gunakan format YYYY-MM-DD (contoh: 2025-11-12).');
        return;
    }

    recordPayment(id, installmentAmount, dateInput);
};

const recordPayment = (id, installmentAmount, datePaid) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || tx.status !== 'aktif') return;
    
    const datePaidObj = new Date(datePaid + 'T00:00:00');
    
    // Sortir riwayat pembayaran sebelum push untuk memastikan urutan waktu
    tx.paymentHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    tx.paymentHistory.push({
        date: datePaid,
        amount: installmentAmount
    });
    
    // Sortir ulang setelah penambahan
    tx.paymentHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (tx.paymentHistory.length >= tx.installmentsCount) {
        tx.status = 'lunas';
        tx.dateCompleted = datePaid; 
    }

    saveTransactions();
    alert(`Pembayaran cicilan ke-${tx.paymentHistory.length} tanggal ${datePaidObj.toLocaleDateString('id-ID')} berhasil dicatat!`);
    closeDetailModal();
    reRenderAllLists();
};

const cancelLastPayment = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || tx.status !== 'aktif' || !tx.paymentHistory || tx.paymentHistory.length === 0) {
        alert('Tidak ada pembayaran aktif yang dapat dibatalkan.');
        return;
    }
    
    // Cari pembayaran terbaru berdasarkan tanggal (DESC)
    const sortedHistory = tx.paymentHistory.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastPayment = sortedHistory[0];

    if (!confirm(`Konfirmasi pembatalan/penghapusan cicilan terakhir (Tgl: ${new Date(lastPayment.date + 'T00:00:00').toLocaleDateString('id-ID')})?`)) return;

    // Cari index pembayaran yang sama dengan lastPayment di array asli (tx.paymentHistory)
    // Perlu cari index yang cocok di array asli
    const indexToRemove = tx.paymentHistory.findIndex(p => p.date === lastPayment.date && p.amount === lastPayment.amount);
    
    if (indexToRemove !== -1) {
        tx.paymentHistory.splice(indexToRemove, 1); 
    } else {
         // Fallback jika tidak ditemukan (seharusnya tidak terjadi)
         tx.paymentHistory.pop();
    }
    
    // Jika statusnya LUNAS, ubah kembali ke AKTIF
    if (tx.status === 'lunas') {
        tx.status = 'aktif';
        tx.dateCompleted = null;
    }
    
    saveTransactions();
    alert('Pembayaran cicilan terakhir berhasil dibatalkan. Silakan input ulang jika terjadi kesalahan.');
    
    closeDetailModal();
    reRenderAllLists(); 
    // Tampilkan ulang modal setelah re-render
    setTimeout(() => showDetailModal(id), 300); 
};

const deleteTransaction = (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini? Aksi ini tidak dapat dibatalkan.')) return;

    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    alert('Transaksi berhasil dihapus.');
    closeDetailModal();
    reRenderAllLists();
};

// ===================================
// 6. FUNGSI IMPORT/EXPORT DATA 
// ===================================

const downloadFile = (content, filename, mimeType) => {
    try {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement("a");
        if (link.download !== undefined) { 
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Membersihkan URL objek
            return true;
        }
        return false;
    } catch (e) {
        console.error("Gagal mendownload file:", e);
        return false;
    }
};

const exportToCSV = () => {
    if (transactions.length === 0) {
        alert('Tidak ada data untuk diexport.');
        return;
    }

    let csv = 'ID,Tipe,Orang,Pokok (Rp),Tgl Mulai,Bunga (%),Tenor (Bulan),Total Akhir (Rp),Sisa (Rp),Status,Tgl Lunas,Riwayat Pembayaran\n';

    transactions.forEach(tx => {
        const totals = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount);
        const paidCount = tx.paymentHistory ? tx.paymentHistory.length : 0;
        const remainingInstallments = tx.installmentsCount - paidCount;
        const remainingTotal = totals.totalPerInstallment * remainingInstallments;
        
        // Urutkan riwayat pembayaran berdasarkan tanggal secara ASC untuk penomoran cicilan
        const sortedHistory = tx.paymentHistory.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

        const paymentDetails = sortedHistory.length > 0
            ? sortedHistory.map((p, i) => `Cicilan ${i+1}: Rp${Math.round(p.amount)} (${p.date})`).join(';')
            : '';

        const row = [
            tx.id,
            tx.type,
            `"${tx.person.replace(/"/g, '""')}"`, 
            cleanPrincipal(tx.principal), 
            tx.startDate,
            cleanInterestRate(tx.interestRate), 
            tx.installmentsCount,
            Math.round(totals.totalAmount),
            Math.round(remainingTotal),
            tx.status,
            tx.dateCompleted || '',
            `"${paymentDetails.replace(/"/g, '""')}"`
        ].join(',');
        
        csv += row + '\n';
    });

    const filename = "catatan_hutang_piutang_export_" + new Date().toISOString().split('T')[0] + ".csv";
    if (downloadFile(csv, filename, 'text/csv;charset=utf-8;')) {
        alert('Data berhasil diexport ke CSV!');
    } else {
        alert('Gagal mendownload file CSV.');
    }
};

const exportToJSON = () => {
    if (transactions.length === 0) {
        alert('Tidak ada data untuk diexport.');
        return;
    }
    
    const jsonContent = JSON.stringify(transactions, null, 2); 
    const filename = "catatan_hutang_piutang_backup_" + new Date().toISOString().split('T')[0] + ".json";
    
    if (downloadFile(jsonContent, filename, 'application/json;charset=utf-8;')) {
        alert('Data berhasil di-backup ke JSON!');
    } else {
        alert('Gagal mendownload file JSON.');
    }
};

const importFromJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('PERINGATAN: Mengimport data akan MENIMPA data yang ada di aplikasi saat ini. Lanjutkan?')) {
        event.target.value = ''; 
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedData) || (importedData.length > 0 && (!importedData[0].id || !importedData[0].type))) {
                alert('Format file JSON tidak valid. Pastikan ini adalah file backup yang benar.');
                event.target.value = '';
                return;
            }
            
            transactions = importedData;
            // Bersihkan data yang mungkin ada dari format lama
            transactions.forEach(tx => {
                if (!tx.paymentHistory) tx.paymentHistory = [];
                // Pastikan format principal dan rate bersih
                tx.principal = cleanPrincipal(tx.principal);
                tx.interestRate = cleanInterestRate(tx.interestRate);
            });
            
            saveTransactions();
            alert('Import data berhasil! Aplikasi dimuat ulang dengan data baru.');
            reRenderAllLists();
            navigateTo('homePage');
            
        } catch (error) {
            console.error("Error saat parsing/import:", error);
            alert('Terjadi kesalahan saat memproses file. Pastikan file JSON tidak rusak.');
        }
         event.target.value = ''; 
    };
    
    reader.onerror = () => {
        alert('Gagal membaca file.');
         event.target.value = '';
    };

    reader.readAsText(file);
};

// ===================================
// 7. FUNGSI UTAMA & INITIALIZATION
// ===================================

window.reRenderAllLists = () => {
    renderSummaryCards();
    renderChart();
    renderLatestTransactions();
    
    const activePageId = document.querySelector('.page.active')?.id; 
    
    // Hanya re-render daftar yang aktif
    if (activePageId === 'piutangPage') renderTransactionList('piutang', 'piutangList');
    if (activePageId === 'utangPage') renderTransactionList('utang', 'utangList');
    if (activePageId === 'historyPage') renderTransactionList('history', 'historyList');
    if (activePageId === 'homePage') {
        renderSummaryCards();
        renderLatestTransactions();
        renderChart();
    }
    if (activePageId === 'summaryPage') renderSummaryCards();
};

const handleBackButton = () => {
    const activePageId = document.querySelector('.page.active')?.id; 
    
    // Jika modal detail terbuka, tutup modal
    if (document.getElementById('transactionDetailModal').style.display === 'block') {
        closeDetailModal();
        return;
    }
    
    // Jika side menu terbuka, tutup side menu
    if (document.getElementById('sideMenuModal').style.display === 'block') {
        closeSideMenu();
        return;
    }
    
    // Navigasi ke homePage
    if (activePageId && activePageId !== 'homePage') {
        navigateTo('homePage');
    } else {
        // Logika keluar aplikasi/history.back()
        if (confirm("Apakah Anda yakin ingin keluar dari aplikasi?")) {
            // Untuk lingkungan Cordova/Native
            if (typeof navigator.app !== 'undefined') {
                navigator.app.exitApp(); 
            } else {
                // Untuk Browser, kembali ke state sebelumnya
                history.back(); 
            }
        }
    }
};


document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    
    menuToggle.addEventListener('click', openSideMenu);
    sideMenuModal.addEventListener('click', (e) => {
        if (e.target.id === 'sideMenuModal') {
            closeSideMenu();
        }
    });
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page');
            navigateTo(pageId);
        });
    });
    
    // Event listener untuk tombol kembali (diperbaiki)
    window.addEventListener('popstate', (event) => {
         closeDetailModal();
         closeSideMenu(); 
         
         const hashPage = window.location.hash.replace('#', '');
         const targetPage = hashPage || 'homePage';
         
         if (document.getElementById(targetPage)) {
             document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
             document.getElementById(targetPage).classList.add('active');
             
             if (targetPage === 'formPage') {
                 fab.classList.remove('show');
             } else {
                 fab.classList.add('show');
             }
             
             reRenderAllLists(); 
         } else if (targetPage === '') {
             navigateTo('homePage');
         }
    });
    
    // Tambahkan listener untuk input file
    const importFileInput = document.getElementById('importFile');
    if (importFileInput) {
         importFileInput.addEventListener('change', importFromJSON);
    }
    
    // Tambahkan listener pada input form untuk update estimasi
    principalInput.addEventListener('keyup', () => { formatInputRupiah(principalInput); updateInstallmentEstimate(); });
    interestRateInput.addEventListener('keyup', updateInstallmentEstimate);
    installmentsCountInput.addEventListener('change', () => { updateInstallmentEstimate(); calculateDueDate(); });
    startDateInput.addEventListener('change', calculateDueDate);

    
    // Inisialisasi navigasi
    const initialPage = window.location.hash.replace('#', '') || 'homePage';
    // Gunakan replaceState untuk initial load agar tidak ada entry ganda di history
    history.replaceState({page: initialPage}, initialPage, `#${initialPage}`); 
    navigateTo(initialPage);
    
    // Iklan AdSense harus di-push saat DOM siap
    if (window.adsbygoogle) {
        window.adsbygoogle.push({});
    }

});

// Ekspor fungsi yang diperlukan agar dapat dipanggil dari HTML
window.formatInputRupiah = formatInputRupiah;
window.updateInstallmentEstimate = updateInstallmentEstimate;
window.calculateDueDate = calculateDueDate;
window.navigateTo = navigateTo;
window.openSideMenu = openSideMenu;
window.closeSideMenu = closeSideMenu;
window.showDetailModal = showDetailModal;
window.closeDetailModal = closeDetailModal;
window.recordPaymentWithDate = recordPaymentWithDate;
window.cancelLastPayment = cancelLastPayment;
window.deleteTransaction = deleteTransaction;
window.filterTransactionList = filterTransactionList;
window.exportToCSV = exportToCSV;
window.exportToJSON = exportToJSON;
window.importFromJSON = importFromJSON;
// window.handleBackButton = handleBackButton; // Dihapus, menggunakan popstate

