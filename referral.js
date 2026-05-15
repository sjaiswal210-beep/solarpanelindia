// ===== REFERRAL SYSTEM =====
// Uses localStorage for offline/instant access + Google Sheets for persistent storage.

const REFERRAL_DB_KEY = 'kalpdev_referral_users';
const REFERRAL_LEADS_KEY = 'kalpdev_referral_leads';
const CURRENT_USER_KEY = 'kalpdev_current_user';
const GOOGLE_SHEET_URL_REF = typeof GOOGLE_SHEET_URL !== 'undefined' ? GOOGLE_SHEET_URL : 'PASTE_YOUR_URL_HERE';

// ===== SAVE TO GOOGLE SHEET =====
function saveToSheet(data) {
    const url = GOOGLE_SHEET_URL_REF;
    if (!url || url === 'PASTE_YOUR_URL_HERE') {
        console.warn('Google Sheet URL not set for referral system.');
        return;
    }
    fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(() => console.log('✅ Saved to Google Sheet'))
      .catch(err => console.error('Sheet error:', err));
}

// ===== UTILITY FUNCTIONS =====
function getUsers() {
    return JSON.parse(localStorage.getItem(REFERRAL_DB_KEY) || '[]');
}

function saveUsers(users) {
    localStorage.setItem(REFERRAL_DB_KEY, JSON.stringify(users));
}

function getLeads() {
    return JSON.parse(localStorage.getItem(REFERRAL_LEADS_KEY) || '[]');
}

function saveLeads(leads) {
    localStorage.setItem(REFERRAL_LEADS_KEY, JSON.stringify(leads));
}

function getCurrentUser() {
    const phone = localStorage.getItem(CURRENT_USER_KEY);
    if (!phone) return null;
    const users = getUsers();
    return users.find(u => u.phone === phone) || null;
}

function setCurrentUser(phone) {
    localStorage.setItem(CURRENT_USER_KEY, phone);
}

function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function generateReferralCode(name) {
    const prefix = 'KDS';
    const namePart = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${namePart}${random}`;
}

// ===== DOM ELEMENTS =====
const loginCard = document.getElementById('loginCard');
const registerCard = document.getElementById('registerCard');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const logoutBtn = document.getElementById('logoutBtn');
const referralCTA = document.getElementById('referralCTA');

// ===== AUTH TOGGLE =====
if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.add('hidden');
        registerCard.classList.remove('hidden');
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
    });
}

// ===== REGISTER =====
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const upi = document.getElementById('regUPI').value.trim();

        if (!/^[0-9]{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        const users = getUsers();
        if (users.find(u => u.phone === phone)) {
            alert('This phone number is already registered. Please login.');
            return;
        }

        const referralCode = generateReferralCode(name);
        const newUser = {
            name,
            phone,
            email,
            password,
            upi,
            referralCode,
            createdAt: new Date().toISOString(),
            totalEarnings: 0
        };

        users.push(newUser);
        saveUsers(users);
        setCurrentUser(phone);

        // Save to Google Sheet
        saveToSheet({
            action: 'register_referral',
            name: name,
            phone: phone,
            email: email,
            password: password,
            upi: upi,
            referralCode: referralCode
        });

        alert(`Registration successful! Your referral code is: ${referralCode}`);
        showDashboard();
    });
}

// ===== LOGIN =====
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('loginPhone').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!/^[0-9]{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.phone === phone && u.password === password);

        if (!user) {
            alert('Invalid phone number or password. Please try again.');
            return;
        }

        setCurrentUser(phone);
        showDashboard();
    });
}

// ===== LOGOUT =====
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        logoutUser();
        showAuth();
    });
}

// ===== SHOW/HIDE SECTIONS =====
function showDashboard() {
    if (authSection) authSection.classList.add('hidden');
    if (dashboardSection) dashboardSection.classList.remove('hidden');
    if (referralCTA) referralCTA.classList.add('hidden');
    updateDashboard();
}

function showAuth() {
    if (authSection) authSection.classList.remove('hidden');
    if (dashboardSection) dashboardSection.classList.add('hidden');
    if (referralCTA) referralCTA.classList.remove('hidden');
    if (loginCard) loginCard.classList.remove('hidden');
    if (registerCard) registerCard.classList.add('hidden');
}

// ===== UPDATE DASHBOARD =====
function updateDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    // Update user name
    const dashUserName = document.getElementById('dashUserName');
    if (dashUserName) dashUserName.textContent = user.name.split(' ')[0];

    // Update referral code
    const userReferralCode = document.getElementById('userReferralCode');
    if (userReferralCode) userReferralCode.textContent = user.referralCode;

    // Get referrals for this user
    const leads = getLeads();
    const myReferrals = leads.filter(l => l.referralCode === user.referralCode);
    const pending = myReferrals.filter(l => l.status === 'pending');
    const approved = myReferrals.filter(l => l.status === 'approved');
    const totalEarnings = approved.length * 5000;

    // Update stats
    document.getElementById('statReferrals').textContent = myReferrals.length;
    document.getElementById('statPending').textContent = pending.length;
    document.getElementById('statApproved').textContent = approved.length;
    document.getElementById('statEarnings').textContent = '₹' + totalEarnings.toLocaleString('en-IN');

    // Update table
    const tableBody = document.getElementById('referralTableBody');
    if (tableBody) {
        if (myReferrals.length === 0) {
            tableBody.innerHTML = '<tr class="empty-row"><td colspan="5">No referrals yet. Share your code to start earning!</td></tr>';
        } else {
            tableBody.innerHTML = myReferrals.map(ref => {
                const statusClass = ref.status === 'approved' ? 'status-approved' : ref.status === 'rejected' ? 'status-rejected' : 'status-pending';
                const statusText = ref.status.charAt(0).toUpperCase() + ref.status.slice(1);
                const reward = ref.status === 'approved' ? '₹5,000' : '-';
                const date = new Date(ref.date).toLocaleDateString('en-IN');
                return `<tr>
                    <td>${ref.name}</td>
                    <td>${ref.phone.substring(0, 3)}****${ref.phone.substring(7)}</td>
                    <td>${date}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td><strong>${reward}</strong></td>
                </tr>`;
            }).join('');
        }
    }

    // Update share message
    const shareMessage = document.getElementById('shareMessage');
    if (shareMessage) {
        shareMessage.value = `🌞 Switch to Solar & Save up to 90% on electricity bills!\n\nKalpDev Solar - Pune's trusted solar brand.\n✅ Government subsidy up to ₹78,000\n✅ Professional engineers team\n✅ 35+ years service\n\n👉 Use my referral code: ${user.referralCode}\n👉 Get a FREE consultation: https://solar-panel-india.com/contact.html?ref=${user.referralCode}\n\nCall: 7350785606`;
    }
}

// ===== COPY & SHARE FUNCTIONS =====
const copyCodeBtn = document.getElementById('copyCodeBtn');
if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
        const user = getCurrentUser();
        if (user) {
            navigator.clipboard.writeText(user.referralCode).then(() => {
                copyCodeBtn.textContent = '✅ Copied!';
                setTimeout(() => { copyCodeBtn.textContent = '📋 Copy Code'; }, 2000);
            }).catch(() => {
                // Fallback
                const temp = document.createElement('input');
                temp.value = user.referralCode;
                document.body.appendChild(temp);
                temp.select();
                document.execCommand('copy');
                document.body.removeChild(temp);
                copyCodeBtn.textContent = '✅ Copied!';
                setTimeout(() => { copyCodeBtn.textContent = '📋 Copy Code'; }, 2000);
            });
        }
    });
}

const shareWhatsappBtn = document.getElementById('shareWhatsappBtn');
if (shareWhatsappBtn) {
    shareWhatsappBtn.addEventListener('click', () => {
        const user = getCurrentUser();
        if (user) {
            const msg = `🌞 Switch to Solar & Save up to 90% on electricity bills!\n\nUse my referral code: ${user.referralCode}\nGet FREE consultation: https://solar-panel-india.com/contact.html?ref=${user.referralCode}\n\nCall: 7350785606`;
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        }
    });
}

const copyMessageBtn = document.getElementById('copyMessageBtn');
if (copyMessageBtn) {
    copyMessageBtn.addEventListener('click', () => {
        const shareMessage = document.getElementById('shareMessage');
        if (shareMessage) {
            navigator.clipboard.writeText(shareMessage.value).then(() => {
                copyMessageBtn.textContent = '✅ Copied!';
                setTimeout(() => { copyMessageBtn.textContent = '📋 Copy Message'; }, 2000);
            }).catch(() => {
                shareMessage.select();
                document.execCommand('copy');
                copyMessageBtn.textContent = '✅ Copied!';
                setTimeout(() => { copyMessageBtn.textContent = '📋 Copy Message'; }, 2000);
            });
        }
    });
}

const shareWA = document.getElementById('shareWA');
if (shareWA) {
    shareWA.addEventListener('click', () => {
        const shareMessage = document.getElementById('shareMessage');
        if (shareMessage) {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage.value)}`, '_blank');
        }
    });
}

const shareSMS = document.getElementById('shareSMS');
if (shareSMS) {
    shareSMS.addEventListener('click', () => {
        const user = getCurrentUser();
        if (user) {
            const msg = `Switch to Solar! Use my code ${user.referralCode} at solar-panel-india.com. Call 7350785606`;
            window.open(`sms:?body=${encodeURIComponent(msg)}`, '_blank');
        }
    });
}

const shareGeneral = document.getElementById('shareGeneral');
if (shareGeneral) {
    shareGeneral.addEventListener('click', () => {
        const user = getCurrentUser();
        if (user && navigator.share) {
            navigator.share({
                title: 'KalpDev Solar - Refer & Earn',
                text: `Switch to Solar! Use my referral code: ${user.referralCode}`,
                url: `https://solar-panel-india.com/contact.html?ref=${user.referralCode}`
            });
        } else {
            alert('Share not supported on this browser. Please copy the message instead.');
        }
    });
}

// ===== CHECK LOGIN ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (user) {
        showDashboard();
    } else {
        showAuth();
    }
});
