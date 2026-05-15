// ===== ADMIN PANEL =====
// Admin credentials (change these in production)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'kalpdev@2025';

const REFERRAL_DB_KEY = 'kalpdev_referral_users';
const REFERRAL_LEADS_KEY = 'kalpdev_referral_leads';
const ADMIN_LOGGED_IN_KEY = 'kalpdev_admin_logged';

// ===== DOM ELEMENTS =====
const adminLoginSection = document.getElementById('adminLoginSection');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const filterStatus = document.getElementById('filterStatus');

// ===== UTILITY =====
function getUsers() {
    return JSON.parse(localStorage.getItem(REFERRAL_DB_KEY) || '[]');
}

function getLeads() {
    return JSON.parse(localStorage.getItem(REFERRAL_LEADS_KEY) || '[]');
}

function saveLeads(leads) {
    localStorage.setItem(REFERRAL_LEADS_KEY, JSON.stringify(leads));
}

function getUserByCode(code) {
    const users = getUsers();
    return users.find(u => u.referralCode === code) || null;
}

// ===== ADMIN LOGIN =====
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUser').value.trim();
        const password = document.getElementById('adminPass').value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem(ADMIN_LOGGED_IN_KEY, 'true');
            showAdminDashboard();
        } else {
            alert('Invalid admin credentials. Please try again.');
        }
    });
}

// ===== ADMIN LOGOUT =====
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem(ADMIN_LOGGED_IN_KEY);
        showAdminLogin();
    });
}

// ===== SHOW/HIDE =====
function showAdminDashboard() {
    adminLoginSection.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    refreshAdminData();
}

function showAdminLogin() {
    adminLoginSection.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
}

// ===== REFRESH DATA =====
function refreshAdminData() {
    const users = getUsers();
    const leads = getLeads();
    const pending = leads.filter(l => l.status === 'pending');
    const approved = leads.filter(l => l.status === 'approved');
    const totalPayout = approved.length * 5000;

    // Update stats
    document.getElementById('adminTotalUsers').textContent = users.length;
    document.getElementById('adminTotalLeads').textContent = leads.length;
    document.getElementById('adminPendingLeads').textContent = pending.length;
    document.getElementById('adminApprovedLeads').textContent = approved.length;
    document.getElementById('adminTotalPayout').textContent = '₹' + totalPayout.toLocaleString('en-IN');

    // Render tables
    renderLeadsTable();
    renderUsersTable();
}

// ===== RENDER LEADS TABLE =====
function renderLeadsTable(statusFilter) {
    const leads = getLeads();
    const filter = statusFilter || (filterStatus ? filterStatus.value : 'all');
    const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
    const tableBody = document.getElementById('adminLeadsTable');

    if (!tableBody) return;

    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="9">No leads found.</td></tr>';
        return;
    }

    tableBody.innerHTML = filtered.map((lead, index) => {
        const referrer = getUserByCode(lead.referralCode);
        const referrerName = referrer ? referrer.name : 'Unknown';
        const statusClass = lead.status === 'approved' ? 'status-approved' : lead.status === 'rejected' ? 'status-rejected' : 'status-pending';
        const statusText = lead.status.charAt(0).toUpperCase() + lead.status.slice(1);
        const date = new Date(lead.date).toLocaleDateString('en-IN');
        const originalIndex = leads.indexOf(lead);

        let actionBtns = '';
        if (lead.status === 'pending') {
            actionBtns = `
                <div class="action-btns">
                    <button class="action-btn approve" onclick="approveLead(${originalIndex})">✅ Approve</button>
                    <button class="action-btn reject" onclick="rejectLead(${originalIndex})">❌ Reject</button>
                </div>`;
        } else {
            actionBtns = `<span class="status-badge ${statusClass}">${statusText}</span>`;
        }

        return `<tr>
            <td><strong>${lead.name}</strong></td>
            <td>${lead.phone}</td>
            <td>${lead.area || '-'}</td>
            <td>${lead.bill ? '₹' + lead.bill : '-'}</td>
            <td><code>${lead.referralCode}</code></td>
            <td>${referrerName}</td>
            <td>${date}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${actionBtns}</td>
        </tr>`;
    }).join('');
}

// ===== RENDER USERS TABLE =====
function renderUsersTable() {
    const users = getUsers();
    const leads = getLeads();
    const tableBody = document.getElementById('adminUsersTable');

    if (!tableBody) return;

    if (users.length === 0) {
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="9">No registered users yet.</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map(user => {
        const userLeads = leads.filter(l => l.referralCode === user.referralCode);
        const approvedLeads = userLeads.filter(l => l.status === 'approved');
        const earnings = approvedLeads.length * 5000;
        const joined = new Date(user.createdAt).toLocaleDateString('en-IN');

        return `<tr>
            <td><strong>${user.name}</strong></td>
            <td>${user.phone}</td>
            <td>${user.email || '-'}</td>
            <td><code>${user.referralCode}</code></td>
            <td>${user.upi || '-'}</td>
            <td>${userLeads.length}</td>
            <td>${approvedLeads.length}</td>
            <td><strong class="text-green">₹${earnings.toLocaleString('en-IN')}</strong></td>
            <td>${joined}</td>
        </tr>`;
    }).join('');
}

// ===== APPROVE / REJECT =====
function approveLead(index) {
    if (!confirm('Approve this referral? The referrer will earn ₹5,000.')) return;
    const leads = getLeads();
    if (leads[index]) {
        leads[index].status = 'approved';
        leads[index].approvedAt = new Date().toISOString();
        saveLeads(leads);
        refreshAdminData();
    }
}

function rejectLead(index) {
    if (!confirm('Reject this referral? This cannot be undone.')) return;
    const leads = getLeads();
    if (leads[index]) {
        leads[index].status = 'rejected';
        leads[index].rejectedAt = new Date().toISOString();
        saveLeads(leads);
        refreshAdminData();
    }
}

// Make functions globally accessible
window.approveLead = approveLead;
window.rejectLead = rejectLead;

// ===== TABS =====
const adminTabs = document.querySelectorAll('.admin-tab');
adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        adminTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById('tab-' + tab.getAttribute('data-tab'));
        if (target) target.classList.add('active');
    });
});

// ===== FILTER =====
if (filterStatus) {
    filterStatus.addEventListener('change', () => {
        renderLeadsTable(filterStatus.value);
    });
}

// ===== CHECK LOGIN ON LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem(ADMIN_LOGGED_IN_KEY) === 'true') {
        showAdminDashboard();
    } else {
        showAdminLogin();
    }
});
