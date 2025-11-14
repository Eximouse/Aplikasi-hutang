// ===================================
// VARIABEL GLOBAL DAN KONSTANTA
// ===================================
let transactions = [];
const form = document.getElementById('transactionForm');
const principalInput = document.getElementById('principal');
const interestRateInput = document.getElementById('interestRate');
const installmentsCountInput = document.getElementById('installmentsCount');
const startDateInput = document.getElementById('startDate');
const finalDueDateDisplay = document.getElementById('finalDueDateDisplay');
const estimateDiv = document.getElementById('installmentEstimate');

const detailModal = document.getElementById('transactionDetailModal');
const paymentModal = document.getElementById('paymentDateModal');
const datePaidInput = document.getElementById('datePaidInput');
const nominalPaidInput = document.getElementById('nominalPaidInput');
const paymentAmountDisplay = document.getElementById('paymentAmountDisplay');
const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

// Variabel state modal
let currentTxId = null;
let currentPaymentData = { totalDue: 0, cumulativeInstallments: 0, totalFine: 0, installmentsToPay: 0 };
let piutangChartInstance = null;

const FINE_RATE = 0.05; // 5% per bulan
const STORAGE_KEY = 'personalFinanceTracker_v2'; // Kunci LocalStorage Utama

// Konstanta Notifikasi
const NOTIFICATION_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 jam dalam milidetik
let notificationScheduler = null;


// ===================================
// 1. MANAJEMEN DATA & LOCAL STORAGE
// ===================================

function loadTransactions() {
    const storedTransactions = localStorage.getItem(STORAGE_KEY);
    if (storedTransactions) {
        try {
            transactions = JSON.parse(storedTransactions);
            // Jika data yang di-load bukan array, inisialisasi sebagai array kosong
            if (!Array.isArray(transactions)) {
                transactions = [];
            }
        } catch (e) {
            console.error("Gagal parse data Local Storage:", e);
            transactions = [];
        }
    }
}

function saveTransactions() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        // Perbarui tampilan data status setelah save
        renderBackupPageData();
    } catch (error) {
        alert('Gagal menyimpan data lokal. Local Storage mungkin penuh.');
        console.error(error);
    }
}

// ===================================
// 2. FUNGSI UTILITAS DATA
// ===================================

function formatInputRupiah(inputElement) {
    let angka = inputElement.value.replace(/\D/g, '');
    if (!angka || angka === '0') {
        inputElement.value = '';
        return;
    }
    let formatted = new Intl.NumberFormat('id-ID').format(angka);
    inputElement.value = formatted;
}

function formatCurrency(amount) {
    const roundedAmount = Math.round(parseFloat(amount) || 0);
    return roundedAmount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function cleanInterestRate(input) {
    return String(input).replace(/,/g, '.').replace(/[^0-9.]/g, '');
}

function cleanPrincipal(input) {
     return parseFloat(String(input).replace(/\./g, '').replace(/,/g, ''));
}

// Hitung estimasi di form
function updateInstallmentEstimate() {
    const principal = cleanPrincipal(principalInput.value) || 0;
    const ratePercent = parseFloat(cleanInterestRate(interestRateInput.value)) || 0;
    const tenor = parseInt(installmentsCountInput.value) || 1;

    if (principal > 0 && tenor > 0) {
        const totals = calculateTotal(principal, ratePercent, tenor);
        estimateDiv.innerHTML = `Estimasi Cicilan per Bulan: <strong>Rp ${formatCurrency(totals.totalPerInstallment)}</strong><br>Total Akhir (Pokok + Bunga): <strong>Rp ${formatCurrency(totals.totalAmount)}</strong>`;
        estimateDiv.style.display = 'block';
    } else {
        estimateDiv.style.display = 'none';
    }
}


function calculateTotal(principal, rate, installmentsCount) {
    const principalAmount = parseFloat(principal);
    const interestRate = parseFloat(rate) / 100;
    const installments = parseInt(installmentsCount);

    if (isNaN(principalAmount) || isNaN(interestRate) || isNaN(installments) || installments <= 0) {
        return { totalInterest: 0, totalAmount: 0, totalPerInstallment: 0 };
    }

    const totalInterest = principalAmount * interestRate * installments;
    const totalAmount = principalAmount + totalInterest;
    const totalPerInstallment = totalAmount / installments;

    return {
        totalInterest: totalInterest,
        totalAmount: totalAmount,
        totalPerInstallment: totalPerInstallment,
    };
}

function calculateDueDate() {
    const startDateValue = startDateInput.value;
    const installments = parseInt(installmentsCountInput.value);

    if (!startDateValue || installments < 1) {
        finalDueDateDisplay.textContent = 'Pilih tanggal mulai dan tenor/cicilan.';
        return '';
    }

    const startDate = new Date(startDateValue + 'T00:00:00');

    if (isNaN(startDate)) {
        finalDueDateDisplay.textContent = 'Tanggal mulai tidak valid.';
        return '';
    }

    const finalDueDate = new Date(startDate);
    const startDay = startDate.getDate();

    finalDueDate.setMonth(finalDueDate.getMonth() + installments);

    // Penyesuaian tanggal akhir bulan (misalnya 31 Januari + 1 bulan = 28/29 Februari)
    if (finalDueDate.getDate() !== startDay) {
         finalDueDate.setDate(0); 
         if (finalDueDate.getDate() < startDay) {
              finalDueDate.setDate(startDay); 
         } else {
              finalDueDate.setDate(0); 
         }
    }

    const formattedDate = finalDueDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    finalDueDateDisplay.textContent = formattedDate;

    const year = finalDueDate.getFullYear();
    const month = String(finalDueDate.getMonth() + 1).padStart(2, '0');
    const day = String(finalDueDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function calculateInstallmentDueDate(tx, installmentIndex) {
     const dateString = tx.startDate;
     if (!dateString || installmentIndex <= 0) return null;

     const startDate = new Date(dateString + 'T00:00:00');
     const startDay = startDate.getDate();

     const targetMonth = startDate.getMonth() + installmentIndex;
     const targetYear = startDate.getFullYear() + Math.floor(targetMonth / 12);
     const newMonth = targetMonth % 12;

     let dueDate = new Date(targetYear, newMonth, startDay);

     if (dueDate.getMonth() !== newMonth) {
          dueDate = new Date(targetYear, newMonth + 1, 0);
     }

     const year = dueDate.getFullYear();
     const month = String(dueDate.getMonth() + 1).padStart(2, '0');
     const day = String(dueDate.getDate()).padStart(2, '0');

     return `${year}-${month}-${day}`;
}

function calculateNextDueDate(tx) {
     const paidCount = tx.paymentHistory ? tx.paymentHistory.reduce((sum, p) => sum + (p.installmentsPaid || 1), 0) : 0;
     if (paidCount >= tx.installmentsCount) return null;

     return calculateInstallmentDueDate(tx, paidCount + 1);
}

function calculateCumulativePayment(tx, currentDateString) {
    if (tx.status !== 'aktif') return { cumulativeInstallments: 0, totalFine: 0, totalOverdueInstallments: 0, fineDetails: [], remainingPrincipal: 0 };

    const totals = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount);
    const installmentAmount = totals.totalPerInstallment;

    const paidTotalCount = tx.paymentHistory ? tx.paymentHistory.reduce((sum, p) => sum + (p.installmentsPaid || 1), 0) : 0;

    let cumulativeInstallments = 0;
    let totalFine = 0;
    let fineDetails = [];
    let totalOverdueInstallments = 0;

    const currentDate = new Date(currentDateString + 'T00:00:00');
    currentDate.setHours(0, 0, 0, 0);

    let firstOverdueDate = null;

    // --- 1. Tentukan Cicilan mana yang SUDAH JATUH TEMPO (Overdue) ---
    for (let i = paidTotalCount + 1; i <= tx.installmentsCount; i++) {
        const dueDateString = calculateInstallmentDueDate(tx, i);
        const dueDate = new Date(dueDateString + 'T00:00:00');
        dueDate.setHours(0, 0, 0, 0);

        if (currentDate >= dueDate) {
             cumulativeInstallments += installmentAmount;
             totalOverdueInstallments++;
             if (firstOverdueDate === null) firstOverdueDate = dueDate;
        } else {
             break;
        }
    }

    // --- 2. Hitung Denda Majemuk ---

    if (totalOverdueInstallments > 0 && firstOverdueDate !== null) {

         const dateDiff = currentDate.getTime() - firstOverdueDate.getTime();
         const daysLate = Math.floor(dateDiff / (1000 * 60 * 60 * 24));
         const monthsLate = Math.floor(daysLate / 30); // Estimasi bulan terlambat

         if (monthsLate > 0) {

             let compoundingBalance = cumulativeInstallments; // Basis denda awal adalah total cicilan tertunggak

             for (let i = 1; i <= monthsLate; i++) {
                 const currentFine = compoundingBalance * FINE_RATE;

                 compoundingBalance += currentFine; // Denda ditambahkan ke basis (Majemuk)
                 totalFine += currentFine;
                 fineDetails.push({
                     month: i,
                     fine: currentFine,
                     basis: compoundingBalance - currentFine
                 });
             }
         }
    }

    const remainingTotalAmount = totals.totalAmount - (paidTotalCount * installmentAmount);

    return {
        cumulativeInstallments: Math.round(cumulativeInstallments),
        totalFine: Math.round(totalFine),
        totalOverdueInstallments: totalOverdueInstallments,
        remainingPrincipal: Math.round(remainingTotalAmount),
        fineDetails: fineDetails
    };
}

function getFinancialTotals() {
    let totalPiutangAwal = 0;
    let sisaPiutang = 0;
    let totalUtangAwal = 0;
    let sisaUtang = 0;

    const todayDate = new Date().toISOString().split('T')[0];

    let chartPiutangAktif = 0;
    let chartPiutangLunas = 0;
    let chartUtangAktif = 0;
    let chartUtangLunas = 0;


    transactions.forEach(tx => {
        const totals = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount);
        const initialTotalWithInterest = totals.totalAmount;

        let totalRemainingWithFine = 0;

        if (tx.status === 'aktif') {
            const cumulativePay = calculateCumulativePayment(tx, todayDate);
            const totalFine = cumulativePay.totalFine;

            const remainingTotal = cumulativePay.remainingPrincipal;
            totalRemainingWithFine = remainingTotal + totalFine;
        }

        if (tx.type === 'piutang') {
            totalPiutangAwal += initialTotalWithInterest;
            if (tx.status === 'aktif') {
                sisaPiutang += totalRemainingWithFine;
                chartPiutangAktif += initialTotalWithInterest;
            } else {
                chartPiutangLunas += initialTotalWithInterest;
            }
        } else if (tx.type === 'utang') {
            totalUtangAwal += initialTotalWithInterest;
            if (tx.status === 'aktif') {
                sisaUtang += totalRemainingWithFine;
                chartUtangAktif += initialTotalWithInterest;
            } else {
                chartUtangLunas += initialTotalWithInterest;
            }
        }
    });

    const netWorthAkhir = sisaPiutang - sisaUtang;

    const totalAwalPiutang = chartPiutangAktif + chartPiutangLunas;
    const totalAwalUtang = chartUtangAktif + chartUtangLunas;

    return {
        totalPiutangAwal: Math.round(totalAwalPiutang),
        sisaPiutang: Math.round(sisaPiutang),
        totalUtangAwal: Math.round(totalUtangAwal),
        sisaUtang: Math.round(sisaUtang),
        netWorthAkhir: Math.round(netWorthAkhir),
        piutangAktif: Math.round(chartPiutangAktif),
        piutangLunas: Math.round(chartPiutangLunas),
        utangAktif: Math.round(chartUtangAktif),
        utangLunas: Math.round(chartUtangLunas)
    };
}

function getDueStatus(dueDate) {
    if (!dueDate) return { badge: 'LUNAS', class: 'status-active' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate + 'T00:00:00');
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { badge: `TERLAMBAT ${Math.abs(diffDays)} hari`, class: 'status-late' };
    } else if (diffDays === 0) {
        return { badge: 'JATUH TEMPO HARI INI', class: 'status-late' };
    } else if (diffDays <= 7) {
        return { badge: `JATUH TEMPO ${diffDays} hari lagi`, class: 'status-active' };
    } else {
        return { badge: 'AKTIF', class: 'status-active' };
    }
}

function renderSummaryCards() {
    const totals = getFinancialTotals();
    const mainDashboard = document.getElementById('mainDashboard');
    mainDashboard.innerHTML = `
        <div class="summary-card card-piutang" onclick="navigateTo('piutangPage')">
            <h3><i class="fas fa-arrow-circle-up"></i> Sisa Piutang Aktif</h3>
            <p>Rp ${formatCurrency(totals.sisaPiutang)}</p>
        </div>
        <div class="summary-card card-utang" onclick="navigateTo('utangPage')">
            <h3><i class="fas fa-arrow-circle-down"></i> Sisa Utang Aktif</h3>
            <p>Rp ${formatCurrency(totals.sisaUtang)}</p>
        </div>
        <div class="summary-card card-networth" onclick="navigateTo('summaryPage')">
            <h3><i class="fas fa-chart-line"></i> Net Worth (Bersih)</h3>
            <p style="color: ${totals.netWorthAkhir >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">Rp ${formatCurrency(totals.netWorthAkhir)}</p>
        </div>
    `;

    document.getElementById('summaryPiutangAwal').textContent = `Rp ${formatCurrency(totals.totalPiutangAwal)}`;
    document.getElementById('summaryPiutangSisa').textContent = `Rp ${formatCurrency(totals.sisaPiutang)}`;
    document.getElementById('summaryUtangAwal').textContent = `Rp ${formatCurrency(totals.totalUtangAwal)}`;
    document.getElementById('summaryUtangSisa').textContent = `Rp ${formatCurrency(totals.sisaUtang)}`;
    document.getElementById('summaryNetWorth').textContent = `Rp ${formatCurrency(totals.netWorthAkhir)}`;
    document.getElementById('summaryNetWorth').style.color = totals.netWorthAkhir >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
}


function sortTransactions(a, b, sortValue) {
    if (sortValue === 'due_asc') {
        const nextDueA = calculateNextDueDate(a) || '9999-12-31';
        const nextDueB = calculateNextDueDate(b) || '9999-12-31';
        return nextDueA.localeCompare(nextDueB);
    } else if (sortValue === 'due_desc') {
        const nextDueA = calculateNextDueDate(a) || '0000-01-01';
        const nextDueB = calculateNextDueDate(b) || '0000-01-01';
        return nextDueB.localeCompare(nextDueA);
    } else if (sortValue === 'amount_desc') {
        const totalsA = calculateTotal(a.principal, a.interestRate, a.installmentsCount);
        const paidCountA = a.paymentHistory ? a.paymentHistory.reduce((sum, p) => sum + (p.installmentsPaid || 1), 0) : 0;
        const remainingA = totalsA.totalPerInstallment * (a.installmentsCount - paidCountA);

        const totalsB = calculateTotal(b.principal, b.interestRate, b.installmentsCount);
        const paidCountB = b.paymentHistory ? b.paymentHistory.reduce((sum, p) => sum + (p.installmentsPaid || 1), 0) : 0;
        const remainingB = totalsB.totalPerInstallment * (b.installmentsCount - paidCountB);

        return remainingB - remainingA;
    } else if (sortValue === 'lunas_desc') {
        const dateA = a.dateCompleted || '0000-01-01';
        const dateB = b.dateCompleted || '0000-01-01';
        return dateB.localeCompare(dateA);
    } else if (sortValue === 'principal_desc') {
        return cleanPrincipal(b.principal) - cleanPrincipal(a.principal);
    }
    return 0;
}


function renderTransactionList(type, containerId) {
    const container = document.getElementById(containerId);
    let listHtml = '';

    let filteredList;
    const typeUC = type.charAt(0).toUpperCase() + type.slice(1);

    if (type === 'history') {
         filteredList = transactions.filter(tx => tx.status === 'lunas');
    } else {
         filteredList = transactions.filter(tx => tx.type === type && tx.status === 'aktif');
    }

    const searchQuery = document.getElementById(`search${typeUC}`)?.value.toLowerCase() || '';
    if (searchQuery) {
        filteredList = filteredList.filter(tx => tx.person.toLowerCase().includes(searchQuery));
    }

    const sortValue = document.getElementById(`sort${typeUC}`)?.value;
    if (sortValue) {
        filteredList.sort((a, b) => sortTransactions(a, b, sortValue));
    }


    if (filteredList.length === 0) {
         container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px 0;">Tidak ada ${type} ${type === 'history' ? 'yang lunas' : 'aktif'} yang tercatat.</p>`;
         return;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    filteredList.forEach(tx => {
        const nextDueDate = calculateNextDueDate(tx);
        const dueStatus = getDueStatus(nextDueDate);

        const paidTotalCount = tx.paymentHistory ? tx.paymentHistory.reduce((sum, p) => sum + (p.installmentsPaid || 1), 0) : 0;

        const cumulativePay = calculateCumulativePayment(tx, todayDate);
        const totalFine = cumulativePay.totalFine;
        const remainingTotal = cumulativePay.remainingPrincipal;
        const totalRemainingWithFine = remainingTotal + totalFine;

        let amountDisplay;
        let dueInfo;
        let badge;

        const nextDueDisplay = nextDueDate ? new Date(nextDueDate + 'T00:00:00').toLocaleDateString('id-ID') : '-';
        const completedDateDisplay = tx.dateCompleted ? new Date(tx.dateCompleted + 'T00:00:00').toLocaleDateString('id-ID') : '-';

        if (tx.status === 'aktif') {
            amountDisplay = `<div class="remaining-amount">Rp ${formatCurrency(totalRemainingWithFine)}</div>`;

            dueInfo = `<div class="due-info">Cicilan ke ${paidTotalCount + 1} (${tx.installmentsCount}x)</div>
                       <div class="due-info">Jatuh Tempo: ${nextDueDisplay}</div>`;

            if (totalFine > 0) {
                const dueMonths = cumulativePay.totalOverdueInstallments;
                amountDisplay = `<div class="remaining-amount" style="color:var(--danger-color);">Rp ${formatCurrency(totalRemainingWithFine)}</div>`;
                badge = `<span class="status-badge status-fine">DENDA (${dueMonths} CICILAN TERLAMBAT)</span>`;
            } else {
                badge = `<span class="status-badge ${dueStatus.class}">${dueStatus.badge}</span>`;
            }
        } else {
            amountDisplay = `<div class="remaining-amount" style="color:var(--success-color);">LUNAS</div>`;
            dueInfo = `<div class="due-info">Pokok: Rp ${formatCurrency(tx.principal)}</div>
                       <div class="due-info">Lunas: ${completedDateDisplay}</div>`;
            badge = `<span class="status-badge" style="background-color: #d4edda; color: var(--success-color);">SELESAI</span>`;
        }

        const initials = tx.person.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        listHtml += `
            <div class="transaction-list-item ${tx.type}" data-id="${tx.id}" onclick="showDetailModal('${tx.id}')">
                <div class="avatar-icon">${initials}</div>
                <div class="info-section">
                    <strong>${tx.person}</strong>
                    <p style="margin: 3px 0 0; font-size: 0.9em; color: var(--text-muted);">${tx.type === 'piutang' ? 'MEMBERI PINJAMAN' : 'MENERIMA PINJAMAN'}</p>
                    ${badge}
                </div>
                <div class="amount-section">
                    ${amountDisplay}
                    ${dueInfo}
                </div>
            </div>
        `;
    });

    container.innerHTML = listHtml;
}

function renderLatestTransactions() {
    const latestContainer = document.getElementById('latestTransactions');
    let activeList = transactions.filter(tx => tx.status === 'aktif');

    activeList.sort((a, b) => {
         const nextDueA = calculateNextDueDate(a) || '9999-12-31';
         const nextDueB = calculateNextDueDate(b) || '9999-12-31';
         return nextDueA.localeCompare(nextDueB);
    });

    const limitedList = activeList.slice(0, 5);

    if (limitedList.length === 0) {
         latestContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px 0;">Tidak ada transaksi aktif.</p>`;
         return;
    }

    let listHtml = '';
    const todayDate = new Date().toISOString().split('T')[0];

    limitedList.forEach(tx => {
        const nextDueDate = calculateNextDueDate(tx);
        const dueStatus = getDueStatus(nextDueDate);

        const paidTotalCount = tx.paymentHistory ? tx.paymentHistory.reduce((sum, p) => sum + (p.installmentsPaid || 1), 0) : 0;

        const cumulativePay = calculateCumulativePayment(tx, todayDate);
        const totalFine = cumulativePay.totalFine;
        const totalRemainingWithFine = cumulativePay.remainingPrincipal + totalFine;


        const initials = tx.person.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        const nextDueDisplay = nextDueDate ? new Date(nextDueDate + 'T00:00:00').toLocaleDateString('id-ID') : '-';

        let badge;
        let amountColor = tx.type === 'piutang' ? 'var(--success-color)' : 'var(--danger-color)';

        if (totalFine > 0) {
             const dueMonths = cumulativePay.totalOverdueInstallments;
             badge = `<span class="status-badge status-fine">DENDA (${dueMonths} CICILAN)</span>`;
             amountColor = 'var(--danger-color)';
        } else {
             badge = `<span class="status-badge ${dueStatus.class}">${dueStatus.badge}</span>`;
        }


        listHtml += `
            <div class="transaction-list-item ${tx.type}" data-id="${tx.id}" onclick="showDetailModal('${tx.id}')">
                <div class="avatar-icon">${initials}</div>
                <div class="info-section">
                    <strong>${tx.person}</strong>
                    <p style="margin: 3px 0 0; font-size: 0.9em; color: var(--text-muted);">
                       ${tx.type === 'piutang' ? 'Piutang' : 'Utang'} | Cicilan ${paidTotalCount + 1} dari ${tx.installmentsCount}
                    </p>
                    ${badge}
                </div>
                <div class="amount-section">
                    <div class="remaining-amount" style="color: ${amountColor};">Rp ${formatCurrency(totalRemainingWithFine)}</div>
                    <div class="due-info">Jatuh Tempo: ${nextDueDisplay}</div>
                </div>
            </div>
        `;
    });
    latestContainer.innerHTML = listHtml;
}

function renderChart() {
    const totals = getFinancialTotals();
    const ctx = document.getElementById('piutangChart').getContext('2d');

    if (piutangChartInstance) {
        piutangChartInstance.destroy();
    }

    const chartData = {
        labels: [
            `Piutang Aktif (Rp ${formatCurrency(totals.piutangAktif)})`,
            `Utang Aktif (Rp ${formatCurrency(totals.utangAktif)})`,
            `Piutang Lunas (Rp ${formatCurrency(totals.piutangLunas)})`,
            `Utang Lunas (Rp ${formatCurrency(totals.utangLunas)})`
        ],
        datasets: [{
            data: [totals.piutangAktif, totals.utangAktif, totals.piutangLunas, totals.utangLunas],
            backgroundColor: [
                '#28a745',
                '#dc3545',
                '#6fcd7e',
                '#ff7c7c'
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
                        label: function(context) {
                            let label = context.label.split(' (')[0] || '';
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
                        const percentage = (value / total) * 100;
                        if (percentage < 3) return '';
                        return percentage.toFixed(1) + '%';
                    },
                    color: '#fff',
                    font: { weight: 'bold', size: 10 }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('#sideMenuContent .menu-item').forEach(item => {
         item.classList.remove('active');
         if (item.getAttribute('data-page') === pageId) {
             item.classList.add('active');
         }
    });

    const fab = document.getElementById('fabAddTransaction');
    if (pageId === 'homePage') {
        fab.classList.add('show');
    } else {
        fab.classList.remove('show');
    }

    reRenderActivePage(pageId);

    closeSideMenu();

    // Update URL Hash untuk navigasi kembali
    if(pageId !== 'homePage') {
        history.pushState({page: pageId}, pageId, `#${pageId}`);
    } else {
         history.pushState({page: 'homePage'}, 'homePage', '#homePage');
    }
}

function reRenderActivePage(pageId) {
    if (pageId === 'homePage') {
        renderSummaryCards();
        renderLatestTransactions();
        renderChart();
        updateNotificationStatusDisplay();
    } else if (pageId === 'piutangPage') {
         renderTransactionList('piutang', 'piutangList');
    } else if (pageId === 'utangPage') {
         renderTransactionList('utang', 'utangList');
    } else if (pageId === 'historyPage') {
         renderTransactionList('history', 'historyList');
    } else if (pageId === 'summaryPage') {
        renderSummaryCards();
    } else if (pageId === 'backupPage') {
        renderBackupPageData();
    }
}

function filterTransactionList(type) {
     renderTransactionList(type, `${type}List`);
}

function openSideMenu() {
    sideMenuModal.style.display = 'block';
    setTimeout(() => {
        sideMenuContent.style.transform = 'translateX(0)';
    }, 10);
}

function closeSideMenu() {
    sideMenuContent.style.transform = 'translateX(-100%)';
    setTimeout(() => {
        sideMenuModal.style.display = 'none';
    }, 300);
}

// ===================================
// 3. FUNGSI BACKUP DAN RESTORE BARU
// ===================================

// Fungsi untuk menampilkan status data di halaman backup
function renderBackupPageData() {
    const dataStatusEl = document.getElementById('data-status');
    const currentDataEl = document.getElementById('current-app-data');

    const storedDataRaw = localStorage.getItem(STORAGE_KEY);

    if (transactions && transactions.length > 0) {
        const piutangCount = transactions.filter(t => t.type === 'piutang').length;
        const utangCount = transactions.filter(t => t.type === 'utang').length;
        dataStatusEl.innerHTML = `Data ditemukan! Total Transaksi: <strong>${transactions.length}</strong> | Piutang: ${piutangCount} | Utang: ${utangCount}`;
        // Gunakan JSON.stringify dengan indentasi 2 untuk tampilan yang lebih rapi
        currentDataEl.textContent = JSON.stringify(transactions, null, 2); 
    } else {
        dataStatusEl.textContent = 'Data transaksi tidak ditemukan di Local Storage atau data kosong.';
        currentDataEl.textContent = '[]';
    }
}


// --- FUNGSI EXPORT DATA (MEMBUAT FILE BACKUP) ---
function exportData() {
    const dataStr = localStorage.getItem(STORAGE_KEY);

    if (!dataStr || dataStr === '[]') {
        alert('Tidak ada data aktif yang dapat di-export!');
        return;
    }

    const blob = new Blob([dataStr], { type: 'application/json' });

    // Membuat nama file yang dinamis
    const date = new Date().toISOString().slice(0, 10);
    const filename = `CatatanKeuangan_Backup_${date}.json`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert(`Data berhasil di-export sebagai: ${filename}`);
}

// --- FUNGSI IMPORT DATA (MEMULIHKAN DARI FILE BACKUP) ---

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        alert('Format file tidak didukung. Harap pilih file JSON (.json).');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Pastikan data yang diimpor adalah Array
            if (Array.isArray(importedData)) {

                const confirmRestore = confirm(
                    `Anda yakin ingin memulihkan data? Data Anda saat ini (${transactions.length} transaksi) akan ditimpa dengan data dari file backup (${importedData.length} transaksi).`
                );

                if (confirmRestore) {
                    transactions = importedData; // Timpa data lama dengan data baru
                    saveTransactions(); // Simpan ke Local Storage

                    alert('Data berhasil di-import dan dipulihkan! Halaman akan dimuat ulang untuk merefresh semua data.');
                    // Muat ulang halaman untuk memastikan semua list dan chart ter-refresh
                    location.reload();
                }
            } else {
                alert('Gagal memulihkan data. Struktur file JSON tidak valid (bukan Array transaksi).');
            }
        } catch (error) {
            alert('Gagal memproses file. Pastikan file bukan korup dan berformat JSON yang benar.');
            console.error('Import error:', error);
        }
    };

    reader.readAsText(file);
    // Reset input file agar event 'change' dapat dipicu lagi jika file yang sama dipilih
    event.target.value = null;
}


// ===================================
// 4. FUNGSI FORM & MODAL
// ===================================

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const principalClean = cleanPrincipal(principalInput.value);
    const rateClean = cleanInterestRate(interestRateInput.value);
    const installments = parseInt(installmentsCountInput.value);
    const finalDueDate = calculateDueDate();

    if (principalClean <= 0 || rateClean < 0 || installments <= 0 || !finalDueDate) {
        alert('Silakan isi semua kolom dengan nilai yang valid (Pokok > 0, Bunga >= 0, Cicilan > 0, Tanggal Valid).');
        return;
    }

    const newTransaction = {
        id: Date.now().toString(),
        type: document.getElementById('type').value,
        person: document.getElementById('person').value,
        principal: principalClean,
        startDate: document.getElementById('startDate').value,
        interestRate: rateClean,
        installmentsCount: installments,
        status: 'aktif',
        dateCompleted: null,
        paymentHistory: []
    };

    transactions.unshift(newTransaction);
    saveTransactions();

    alert(`Transaksi ${newTransaction.type.toUpperCase()} dengan ${newTransaction.person} berhasil dicatat!`);
    form.reset();
    principalInput.value = '';
    interestRateInput.value = '0';
    installmentsCountInput.value = '1';
    finalDueDateDisplay.textContent = 'Pilih tanggal mulai dan tenor/cicilan.';
    estimateDiv.style.display = 'none';

    reRenderAllLists();
    navigateTo('homePage');
});


function showDetailModal(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx) {
         alert('Error: Transaksi tidak ditemukan atau ID tidak valid.');
         return;
    }

    detailModal.dataset.txId = id;

    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalActions = document.getElementById('modalActions');

    const totals = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount);

    const paidTotalCount = tx.paymentHistory ? tx.paymentHistory.reduce((sum, p) => sum + (p.installmentsPaid || 1), 0) : 0;
    const remainingInstallments = tx.installmentsCount - paidTotalCount;
    const nextDueDate = calculateNextDueDate(tx);

    const todayDate = new Date().toISOString().split('T')[0];
    const cumulativePay = calculateCumulativePayment(tx, todayDate);
    const cumulativeInstallmentsDue = cumulativePay.cumulativeInstallments;
    const totalFine = cumulativePay.totalFine;
    const dueMonths = cumulativePay.totalOverdueInstallments;

    const remainingPrincipal = cumulativePay.remainingPrincipal;
    const totalRemainingWithFine = remainingPrincipal + totalFine;


    let amountToPay = 0;
    let installmentsToPay = 0;

    if (remainingInstallments > 0) {
        if (dueMonths > 0) {
            // Bayar tagihan cicilan tertunggak + denda
            amountToPay = cumulativeInstallmentsDue + totalFine;
            installmentsToPay = dueMonths;
        } else {
            // Bayar cicilan bulan ini (1x)
            amountToPay = totals.totalPerInstallment;
            installmentsToPay = 1;
        }
    } else {
         amountToPay = 0;
         installmentsToPay = 0;
    }

    currentPaymentData = {
         totalDue: Math.round(amountToPay),
         cumulativeInstallments: cumulativeInstallmentsDue,
         totalFine: totalFine,
         installmentsToPay: installmentsToPay
    };

    const nextDueDisplay = nextDueDate ? new Date(nextDueDate + 'T00:00:00').toLocaleDateString('id-ID') : '-';


    modalTitle.innerHTML = `<i class="fas fa-info-circle"></i> ${tx.type === 'piutang' ? 'Piutang' : 'Utang'} dengan ${tx.person}`;

    let historyHtml = tx.paymentHistory && tx.paymentHistory.length > 0
        ? tx.paymentHistory.map((p, index) => {
            const isLast = index === tx.paymentHistory.length - 1;
            const deleteButton = isLast && tx.status === 'aktif'
                ? `<i class="fas fa-undo" style="color: var(--danger-color); cursor: pointer; font-size: 0.9em; margin-left: 10px;" onclick="cancelLastPayment('${tx.id}'); event.stopPropagation();" title="Batalkan Pembayaran Terakhir"></i>`
                : '';

            const paidCountDisplay = p.installmentsPaid && p.installmentsPaid > 1 ? ` (${p.installmentsPaid}x)` : '';

            const totalAmountPaid = (p.amount || 0) + (p.fine || 0);
            let amountDisplay = `Rp ${formatCurrency(totalAmountPaid)}`;
            if (p.fine && p.fine > 0) {
                 amountDisplay = `Rp ${formatCurrency(totalAmountPaid)} <span style="color: var(--danger-color); font-size: 0.8em;">(Termasuk Denda Rp ${formatCurrency(p.fine)})</span>`;
            }

            // Urutan riwayat dibalik, jadi ini Bayar ke-1, dst.
            const paymentIndex = tx.paymentHistory.length - index;

            return `
                <div>
                    <span>Bayar ke-${paymentIndex} ${paidCountDisplay} (${new Date(p.date + 'T00:00:00').toLocaleDateString('id-ID')})</span>
                    <strong>${amountDisplay}${deleteButton}</strong>
                </div>
            `;
          }).join('')
        : '<p style="text-align: center; font-size: 0.9em; color: var(--text-muted);">Belum ada riwayat pembayaran.</p>';

    let fineRow = '';
    if (totalFine > 0) {

        const fineDetailsList = cumulativePay.fineDetails.map(detail => `
            <div style="display: flex; justify-content: space-between; font-size: 0.8em; color: var(--text-muted); padding: 3px 0; border-bottom: 1px dotted #ccc;">
                <span>Denda Bulan ke-${detail.month} (Basis: Rp ${formatCurrency(detail.basis)}):</span>
                <strong>Rp ${formatCurrency(detail.fine)}</strong>
            </div>
        `).join('');

        fineRow = `
            <div style="padding: 10px 0;">
                <h3 style="color: var(--danger-color); border-bottom: none; font-size: 1.05em; margin-bottom: 5px;"><i class="fas fa-exclamation-triangle"></i> Detail Keterlambatan & Denda (${(FINE_RATE * 100)}%/bln)</h3>
                <div class="modal-detail-row fine-info">
                    <span>Tagihan Cicilan Tertunggak (${dueMonths}x):</span>
                    <strong>+ Rp ${formatCurrency(cumulativeInstallmentsDue)}</strong>
                </div>
                <div class="modal-detail-row fine-info">
                    <span>Total Akumulasi Denda:</span>
                    <strong>+ Rp ${formatCurrency(totalFine)}</strong>
                </div>
                <div style="margin-top: 10px; padding: 10px; border: 1px dashed var(--danger-color); border-radius: 4px; background-color: #fef0f0;">
                     <h4 style="font-size: 0.9em; margin: 0 0 5px 0; color: var(--danger-color);">Rincian Denda Majemuk:</h4>
                     ${fineDetailsList || '<p style="font-size: 0.8em; color: var(--text-muted); text-align: center; margin: 0;">Keterlambatan belum mencapai 1 bulan penuh (Tanpa Denda).</p>'}
                </div>
            </div>
        `;
    }


    modalContent.innerHTML = `
        <div class="modal-detail-row"><span>Status:</span> <strong>${tx.status.toUpperCase()}</strong></div>
        <div class="modal-detail-row"><span>Pokok Pinjaman:</span> <strong>Rp ${formatCurrency(tx.principal)}</strong></div>
        <div class="modal-detail-row"><span>Total dengan Bunga (${tx.interestRate}% Flat):</span> <strong>Rp ${formatCurrency(totals.totalAmount)}</strong></div>
        <div class="modal-detail-row"><span>Tenor/Cicilan:</span> <strong>${tx.installmentsCount} Bulan</strong></div>
        <div class="modal-detail-row"><span>Cicilan per Bulan:</span> <strong>Rp ${formatCurrency(totals.totalPerInstallment)}</strong></div>

        ${fineRow}

        <hr style="margin: 10px 0; border-color: var(--border-color);">

        <div class="modal-detail-row" style="font-size: 1.15em; font-weight: bold; color: ${tx.type === 'piutang' ? 'var(--success-color)' : 'var(--danger-color)'};">
            <span>Sisa Total Pinjaman (Termasuk Denda):</span> <strong>Rp ${formatCurrency(totalRemainingWithFine)}</strong>
        </div>
        ${tx.status === 'aktif' ? `
            <div class="modal-detail-row"><span>Sisa Cicilan Belum Dibayar:</span> <strong>${remainingInstallments} dari ${tx.installmentsCount}</strong></div>
            <div class="modal-detail-row"><span>Jatuh Tempo Cicilan Berikut:</span> <strong>${nextDueDisplay}</strong></div>
        ` : ''}

        <h3><i class="fas fa-list-alt"></i> Riwayat Pembayaran (${tx.paymentHistory ? tx.paymentHistory.length : 0}x)</h3>
        <div class="payment-history-list">${historyHtml}</div>
    `;

    modalActions.innerHTML = '';
    if (tx.status === 'aktif') {
        if (remainingInstallments > 0) {
             modalActions.innerHTML += `<button style="background-color: var(--success-color);" onclick="openPaymentModal('${tx.id}')">Catat Pembayaran Tagihan (Rp ${formatCurrency(currentPaymentData.totalDue)})</button>`;
        } else {
             modalActions.innerHTML += `<p style="text-align: center; color: var(--success-color); font-weight: bold; padding: 10px;">Semua cicilan sudah dilunasi secara hitungan, namun status masih AKTIF. Harap hapus atau ubah status secara manual jika perlu.</p>`;
        }
        modalActions.innerHTML += `<button style="background-color: var(--danger-color);" onclick="deleteTransaction('${tx.id}')">Hapus Transaksi</button>`;
    } else {
         modalActions.innerHTML += `<p style="text-align: center; color: var(--success-color); font-weight: bold; padding: 10px;">Transaksi ini sudah LUNAS pada ${new Date(tx.dateCompleted + 'T00:00:00').toLocaleDateString('id-ID')}.</p>`;
         modalActions.innerHTML += `<button style="background-color: var(--danger-color);" onclick="deleteTransaction('${tx.id}')">Hapus Transaksi (Riwayat)</button>`;
    }

    detailModal.style.display = 'block';
}

function closeDetailModal() {
    document.getElementById('transactionDetailModal').style.display = 'none';
    detailModal.dataset.txId = '';
}

function openPaymentModal(id) {
    currentTxId = id;

    const tx = transactions.find(t => t.id === currentTxId);
    if (!tx) return;

    const totalAmountToPay = currentPaymentData.totalDue;
    const installmentsToPay = currentPaymentData.installmentsToPay;
    const totalFine = currentPaymentData.totalFine;

    let displayHtml = `Tagihan yang harus dibayar saat ini adalah: <strong style="color: var(--success-color); font-size: 1.4em;">Rp ${formatCurrency(totalAmountToPay)}</strong>`;

    if (installmentsToPay > 1) {
        displayHtml += `<br><span style="color: var(--primary-color); font-weight: 600;">Ini akan melunasi **${installmentsToPay} cicilan** tertunggak.</span>`;
    }

    if (totalFine > 0) {
        displayHtml += `<br><span style="color: var(--danger-color); font-weight: 600;">Termasuk denda sebesar Rp ${formatCurrency(totalFine)}</span>`;
    }

    if (totalAmountToPay <= 0) {
         displayHtml = `<span style="color: var(--primary-color);">Tidak ada tagihan yang harus dibayar saat ini (Rp 0).</span>`;
    }

    paymentAmountDisplay.innerHTML = displayHtml;
    datePaidInput.value = new Date().toISOString().split('T')[0];

    nominalPaidInput.value = formatCurrency(totalAmountToPay);

    paymentModal.style.display = 'flex';
}

function closePaymentModal() {
    paymentModal.style.display = 'none';
    nominalPaidInput.value = '';

    if (detailModal.dataset.txId) {
         showDetailModal(detailModal.dataset.txId);
    }
}

confirmPaymentBtn.addEventListener('click', function() {
    const tx = transactions.find(t => t.id === currentTxId);
    if (!tx) {
         alert('Error: Transaksi tidak ditemukan.');
         return;
    }

    const datePaid = datePaidInput.value;
    const nominalPaidClean = cleanPrincipal(nominalPaidInput.value) || 0;

    if (!datePaid) {
        alert('Tanggal pembayaran harus diisi.');
        return;
    }

    if (nominalPaidClean <= 0) {
         alert('Nominal pembayaran harus lebih dari Rp 0.');
         return;
    }

    const installmentAmount = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount).totalPerInstallment;

    let totalPaid = nominalPaidClean;
    let remainingPayment = totalPaid;
    let totalFinePaid = 0;
    let installmentsCovered = 0;

    const todayDate = new Date().toISOString().split('T')[0];
    const cumulativePay = calculateCumulativePayment(tx, todayDate);

    // 1. Bayar Denda (Jika Ada)
    if (cumulativePay.totalFine > 0) {
        const fineToPay = Math.min(cumulativePay.totalFine, remainingPayment);
        totalFinePaid = fineToPay;
        remainingPayment -= fineToPay;
    }

    // 2. Bayar Cicilan Tertunggak (Jika Ada)
    if (cumulativePay.cumulativeInstallments > 0 && remainingPayment > 0) {
        // Tentukan jumlah cicilan yang bisa dicover dari sisa pembayaran setelah bayar denda
        const tertunggakCovered = Math.min(
            cumulativePay.totalOverdueInstallments,
            Math.floor(remainingPayment / installmentAmount)
        );

        if (tertunggakCovered > 0) {
            const amountToCover = tertunggakCovered * installmentAmount;
            remainingPayment -= amountToCover;
            installmentsCovered += tertunggakCovered;
        }
    }

    // 3. Bayar Cicilan Berikutnya (Belum Jatuh Tempo)
    if (remainingPayment > 0) {
         const totalPaidCountBeforePayment = tx.paymentHistory ? tx.paymentHistory.reduce((sum, p) => sum + (p.installmentsPaid || 1), 0) : 0;
         const remainingPossibleInstallments = tx.installmentsCount - totalPaidCountBeforePayment;

         const nextInstallmentsCovered = Math.min(
             remainingPossibleInstallments - installmentsCovered, // Jangan melebihi total sisa cicilan
             Math.floor(remainingPayment / installmentAmount) // Berdasarkan sisa uang
         );

         if (nextInstallmentsCovered > 0) {
             const amountToCover = nextInstallmentsCovered * installmentAmount;
             remainingPayment -= amountToCover;
             installmentsCovered += nextInstallmentsCovered;
         }
    }

    if (installmentsCovered === 0) {
         alert(`Pembayaran Rp ${formatCurrency(totalPaid)} tidak cukup untuk melunasi 1 cicilan (Rp ${formatCurrency(installmentAmount)}) setelah membayar denda Rp ${formatCurrency(totalFinePaid)}.`);
         return;
    }

    const amountToRecord = (totalPaid - remainingPayment) - totalFinePaid;

    recordPayment(currentTxId, amountToRecord, totalFinePaid, installmentsCovered, datePaid);
});

function recordPayment(id, amountCovered, fineAmount, installmentsCovered, datePaid) {
    const tx = transactions.find(t => t.id === id);
    if (!tx || tx.status !== 'aktif') return;

    tx.paymentHistory.push({
        date: datePaid,
        amount: amountCovered,
        fine: fineAmount,
        installmentsPaid: installmentsCovered
    });

    let totalPaidCount = tx.paymentHistory.reduce((sum, p) => sum + (p.installmentsPaid || 1), 0);

    if (totalPaidCount >= tx.installmentsCount) {
        tx.status = 'lunas';
        tx.dateCompleted = datePaid;
        alert(`Transaksi ${tx.person} LUNAS! Total cicilan dicover: ${totalPaidCount}.`);
    } else {
        alert(`Pembayaran berhasil dicatat! Dicover: **${installmentsCovered}** cicilan. Sisa ${tx.installmentsCount - totalPaidCount} cicilan.`);
    }

    saveTransactions();

    closePaymentModal();
    reRenderAllLists();
}

function cancelLastPayment(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx || !tx.paymentHistory || tx.paymentHistory.length === 0) {
        alert('Tidak ada pembayaran aktif yang dapat dibatalkan.');
        return;
    }

    const lastPayment = tx.paymentHistory[tx.paymentHistory.length - 1];
    const installmentsCancelled = lastPayment.installmentsPaid || 1;
    const totalAmountCancelled = (lastPayment.amount || 0) + (lastPayment.fine || 0);

    if (!confirm(`Konfirmasi pembatalan pembayaran terakhir? Aksi ini akan membatalkan **${installmentsCancelled} cicilan** senilai Rp ${formatCurrency(totalAmountCancelled)}.`)) return;

    tx.paymentHistory.pop();

    const totalPaidCount = tx.paymentHistory.reduce((sum, p) => sum + (p.installmentsPaid || 1), 0);

    if (tx.status === 'lunas' && totalPaidCount < tx.installmentsCount) {
        tx.status = 'aktif';
        tx.dateCompleted = null;
    }

    saveTransactions();
    alert('Pembayaran cicilan terakhir berhasil dibatalkan. Status transaksi diaktifkan kembali.');

    closeDetailModal();
    reRenderAllLists();
    setTimeout(() => showDetailModal(id), 300);
}

function deleteTransaction(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus permanen transaksi ${tx.type} dengan ${tx.person} (Status: ${tx.status.toUpperCase()})? Aksi ini tidak dapat dibatalkan.`)) return;

    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    alert('Transaksi berhasil dihapus.');
    closeDetailModal();
    reRenderAllLists();
}

// ===================================
// 5. FUNGSI NOTIFIKASI OTOMATIS BARU
// ===================================

// 5.1 Meminta Izin Notifikasi
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.error("Browser tidak mendukung notifikasi.");
        updateNotificationStatusDisplay("Browser tidak mendukung Notifikasi Web. Fitur dinonaktifkan.", 'danger');
        return;
    }

    Notification.requestPermission().then(permission => {
        updateNotificationStatusDisplay(`Status Izin: ${permission.toUpperCase()}`, permission === 'granted' ? 'success' : 'warning');
        if (permission === 'granted') {
            startNotificationScheduler();
        } else if (permission === 'denied') {
            alert('Anda menolak izin notifikasi. Fitur notifikasi otomatis tidak akan berfungsi.');
        }
    });
}

// 5.2 Mengirim Notifikasi
function sendNotification(title, body, isSilent) {
    if (Notification.permission === "granted") {
        const options = {
            body: body,
            // Ikon ini akan muncul di notifikasi OS.
            icon: 'assets/logo-app.png', // Menggunakan aset gambar dari repo Anda.
            silent: isSilent,
            vibrate: isSilent ? [] : [200, 100, 200],
            renotify: true,
            tag: 'debt-due-alert'
        };

        new Notification(title, options);
    }
}

// 5.3 Logika Utama Pengecekan dan Pengiriman
function checkAndSendNotifications() {
    if (Notification.permission !== "granted") {
        console.log("Notifikasi tidak dikirim: Izin ditolak atau belum diberikan.");
        return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const todayDate = now.toISOString().split('T')[0];

    // Logika Mode Malam (00:00:00 hingga 05:59:59)
    const isNightMode = currentHour >= 0 && currentHour < 6;

    let dueTransactions = [];

    transactions.forEach(tx => {
        if (tx.status !== 'aktif') return;

        const nextDueDate = calculateNextDueDate(tx);
        if (!nextDueDate) return;

        const dueStatus = getDueStatus(nextDueDate);

        // Pemicu: Jatuh Tempo HARI INI atau TERLAMBAT
        if (dueStatus.badge === 'JATUH TEMPO HARI INI' || dueStatus.class === 'status-late') {

            const cumulativePay = calculateCumulativePayment(tx, todayDate);
            const totalDue = cumulativePay.cumulativeInstallments + cumulativePay.totalFine;

            if (totalDue > 0) {
                dueTransactions.push({
                    type: tx.type,
                    person: tx.person,
                    total: totalDue,
                    statusText: dueStatus.badge,
                    dueMonths: cumulativePay.totalOverdueInstallments
                });
            }
        }
    });

    if (dueTransactions.length > 0) {
        dueTransactions.forEach(item => {
            const typeText = item.type === 'piutang' ? 'Piutang (Klaim)' : 'Utang (Kewajiban)';
            const statusType = item.statusText.includes('TERLAMBAT') || item.statusText.includes('HARI INI') ? 'PENTING' : 'PERINGATAN';

            let title = `🔔 ${statusType}: ${item.statusText} ${typeText}!`;
            let body = `Tagihan ${item.person} sebesar Rp ${formatCurrency(item.total)}.`;

            if (item.dueMonths > 0) {
                body += ` (${item.dueMonths}x Cicilan Tertunggak + Denda)`;
            }

            sendNotification(title, body, isNightMode);
        });
        console.log(`[Notifikasi Otomatis] Dikirim: ${dueTransactions.length} transaksi. Mode Malam: ${isNightMode ? 'Ya (Silent)' : 'Tidak (Bersuara)'}`);
    } else {
         console.log("[Notifikasi Otomatis] Tidak ada tagihan yang Jatuh Tempo/Terlambat.");
    }
}

// 5.4 Penjadwal (Set Interval 6 Jam)
function startNotificationScheduler() {
    if (notificationScheduler) {
        clearInterval(notificationScheduler); // Hentikan jadwal lama jika ada
    }

    // Panggil pertama kali saat dimulai
    checkAndSendNotifications();

    // Penjadwalan berulang (simulasi 4x24 jam)
    notificationScheduler = setInterval(() => {
        checkAndSendNotifications();
    }, NOTIFICATION_INTERVAL_MS);

    console.log(`[Notifikasi Otomatis] Penjadwal diaktifkan. Interval: ${NOTIFICATION_INTERVAL_MS / 1000 / 60 / 60} jam.`);
}

// 5.5 Update Tampilan Status di Home
function updateNotificationStatusDisplay(status = null, type = null) {
    const statusElement = document.getElementById('notificationStatusText');
    const statusContainer = statusElement.closest('.notification-status-info');
    const button = statusContainer.querySelector('button');

    const currentPermission = Notification.permission;

    // Reset styles
    statusContainer.style.backgroundColor = '';
    statusContainer.style.color = '';

    if (status) {
        statusElement.innerHTML = `<i class="fas fa-bell"></i> ${status}`;
    } else if (currentPermission === 'granted') {
         statusElement.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success-color);"></i> **Aktif.** Pengecekan tagihan dijadwalkan setiap 6 jam.`;
         statusContainer.style.backgroundColor = '#d4edda'; // Light Green
         statusContainer.style.color = '#155724';
         button.style.display = 'none';
         startNotificationScheduler();
    } else if (currentPermission === 'denied') {
         statusElement.innerHTML = `<i class="fas fa-times-circle" style="color: var(--danger-color);"></i> **Ditolak.** Notifikasi dinonaktifkan oleh pengguna.`;
         statusContainer.style.backgroundColor = '#f8d7da'; // Light Red
         statusContainer.style.color = '#721c24';
         button.textContent = 'Minta Izin Ulang';
         button.style.display = 'inline-block';
         if (notificationScheduler) clearInterval(notificationScheduler);
    } else { // default/prompt
         statusElement.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: var(--warning-color);"></i> **Belum Diizinkan.** Klik tombol untuk mengaktifkan peringatan tagihan.`;
         statusContainer.style.backgroundColor = '#fff3cd'; // Light Yellow
         statusContainer.style.color = '#856404';
         button.textContent = 'Aktifkan Izin Notifikasi';
         button.style.display = 'inline-block';
    }
}


// ===================================
// 6. FUNGSI UTAMA & INITIALIZATION
// ===================================

function reRenderAllLists() {
    const activePageId = document.querySelector('.page.active')?.id || 'homePage';
    reRenderActivePage(activePageId);
}

function exportToCSV() {
    if (transactions.length === 0) {
        alert('Tidak ada data untuk diexport.');
        return;
    }

    let csv = 'ID,Tipe,Orang,Pokok (Rp),Tgl Mulai,Bunga (%),Tenor (Bulan),Total Akhir (Rp),Sisa Aktif (Rp - Termasuk Denda),Status,Tgl Lunas,Riwayat Pembayaran\n';

    transactions.forEach(tx => {
        const totals = calculateTotal(tx.principal, tx.interestRate, tx.installmentsCount);

        const todayDate = new Date().toISOString().split('T')[0];
        const cumulativePay = calculateCumulativePayment(tx, todayDate);
        const totalRemainingWithFine = cumulativePay.remainingPrincipal + cumulativePay.totalFine;

        const paymentDetails = tx.paymentHistory
            ? tx.paymentHistory.map((p, i) => {
                 const paidInstallments = p.installmentsPaid || 1;
                 const totalPaid = (p.amount || 0) + (p.fine || 0);
                 const fineInfo = p.fine && p.fine > 0 ? `+Denda Rp${Math.round(p.fine)}` : '';
                 return `Bayar ${paidInstallments}x: Rp${Math.round(totalPaid)} (${p.date})${fineInfo}`;
              }).join('; ')
            : '';

        const row = [
            tx.id,
            tx.type,
            `"${tx.person.replace(/"/g, '""')}"`,
            cleanPrincipal(tx.principal),
            tx.startDate,
            tx.interestRate,
            tx.installmentsCount,
            Math.round(totals.totalAmount),
            Math.round(totalRemainingWithFine),
            tx.status,
            tx.dateCompleted || '',
            `"${paymentDetails.replace(/"/g, '""')}"`
        ].map(item => (typeof item === 'string' && item.includes(',') ? `"${item}"` : item)).join(',');

        csv += row + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "catatan_hutang_piutang_export_" + new Date().toISOString().split('T')[0] + ".csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}


function handleBackKey(event) {
    if (event.key === 'Escape' || event.type === 'backbutton') {

        if (event.type === 'backbutton') event.preventDefault();

        if (paymentModal.style.display === 'flex') {
            closePaymentModal();
            return;
        }

        else if (detailModal.style.display === 'block') {
            closeDetailModal();
            return;
        }

        else if (sideMenuModal.style.display === 'block') {
            closeSideMenu();
            return;
        }

        const activePageId = document.querySelector('.page.active')?.id;
        if (activePageId && activePageId !== 'homePage') {
             navigateTo('homePage');
        } else {
             // Konfirmasi keluar hanya untuk PWA/Aplikasi Hibrida
             if (confirm("Apakah Anda yakin ingin keluar dari aplikasi?")) {
                 if (typeof navigator.app !== 'undefined' && typeof navigator.app.exitApp === 'function') {
                     navigator.app.exitApp();
                 } else {
                      // Do nothing for web
                 }
             }
        }
    }
}


// Event listener untuk menutup modal jika mengklik di luar konten
detailModal.addEventListener('click', function(e) {
    if (e.target.id === 'transactionDetailModal') {
        closeDetailModal();
    }
});

paymentModal.addEventListener('click', function(e) {
    if (e.target.id === 'paymentDateModal') {
        closePaymentModal();
    }
});


document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    calculateDueDate();

    // Event Menu Samping
    document.getElementById('menuToggle').addEventListener('click', openSideMenu);
    document.getElementById('sideMenuModal').addEventListener('click', (e) => {
        if (e.target.id === 'sideMenuModal') {
            closeSideMenu();
        }
    });

    document.querySelectorAll('#sideMenuContent .menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page');
            if (pageId) navigateTo(pageId);
        });
    });

    // Setup Event Listener Backup/Restore
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('trigger-import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', handleImport);


    // Handle navigasi via hash URL
    window.addEventListener('popstate', function(event) {
         closeSideMenu();

         const hash = window.location.hash.replace('#', '');
         const targetPage = hash || 'homePage';

         if (document.getElementById(targetPage)) {
             navigateTo(targetPage);
         }
    });

    // Handle Back Button pada perangkat (PWA/Cordova)
    if (typeof document.addEventListener === 'function') {
        // Hanya tambahkan untuk lingkungan yang mendukung event 'backbutton' (misal: Cordova)
        if (typeof window.cordova !== 'undefined') {
            document.addEventListener('backbutton', handleBackKey, false);
        }
    }
    // Tambahkan untuk key Escape pada desktop/browser
    document.addEventListener('keydown', handleBackKey);

    const initialPage = window.location.hash.replace('#', '') || 'homePage';
    navigateTo(initialPage);

    // Initialize Notification Status and Scheduler
    updateNotificationStatusDisplay();
});
