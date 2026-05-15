// ===== GOOGLE SHEETS INTEGRATION =====
// Your Google Sheet: https://docs.google.com/spreadsheets/d/1XWDbziEtUj9kb5Tje-xH5DykoY9H9DhO4hOJo5oDJD8/
// 
// HOW TO CONNECT (one-time setup - 3 minutes):
// 1. Open your Google Sheet above
// 2. Click Extensions → Apps Script
// 3. Delete any code there and paste this:
//
//    function doPost(e) {
//      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//      var data = JSON.parse(e.postData.contents);
//      sheet.appendRow([new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}), data.name, data.phone, data.source]);
//      return ContentService.createTextOutput('success');
//    }
//
// 4. Click Save, then Deploy → New Deployment
// 5. Type: Web app | Execute as: Me | Access: Anyone
// 6. Click Deploy → Copy the URL
// 7. Paste that URL below replacing 'PASTE_YOUR_URL_HERE'
//
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyX8jCGyVONoWsK8q0cQhzfdgp0a5I14ShhOTQP2M27VWKFUTn8-yU1pGqG21uRCvk5/exec';

// Save lead to Google Sheet
function saveToGoogleSheet(data) {
    if (!GOOGLE_SHEET_URL) {
        console.warn('⚠️ Google Sheet URL not set. Open script.js and follow the setup instructions at the top.');
        saveToLocalStorage(data);
        return;
    }

    fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => console.log('✅ Lead saved to Google Sheet'))
    .catch((error) => {
        console.error('❌ Sheet error:', error);
        saveToLocalStorage(data);
    });
}

// Backup: Save to localStorage
function saveToLocalStorage(data) {
    const leads = JSON.parse(localStorage.getItem('kalpdev_leads') || '[]');
    leads.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem('kalpdev_leads', JSON.stringify(leads));
    console.log('Lead saved to localStorage (backup)');
}

// ===== POPUP FLASH - Lead Capture =====
const popupOverlay = document.getElementById('popupOverlay');
const popupClose = document.getElementById('popupClose');
const popupForm = document.getElementById('popupForm');
const heroOfferBtn = document.getElementById('heroOfferBtn');
const offerBannerBtn = document.getElementById('offerBannerBtn');

function showPopup() {
    if (popupOverlay) {
        popupOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hidePopup() {
    if (popupOverlay) {
        popupOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Show popup after 3 seconds on page load
if (popupOverlay) {
    setTimeout(() => {
        // Only show if not already dismissed this session
        if (!sessionStorage.getItem('popupDismissed')) {
            showPopup();
        }
    }, 3000);
}

if (popupClose) {
    popupClose.addEventListener('click', () => {
        hidePopup();
        sessionStorage.setItem('popupDismissed', 'true');
    });
}

// Close popup on overlay click
if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            hidePopup();
            sessionStorage.setItem('popupDismissed', 'true');
        }
    });
}

// Popup form submit
if (popupForm) {
    popupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('popupName').value;
        const phone = document.getElementById('popupPhone').value;

        if (!/^[0-9]{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        // Save to Google Sheet
        saveToGoogleSheet({
            name: name,
            phone: phone,
            source: 'popup_coupon',
            message: '₹20,000 OFF Coupon Request'
        });

        const msg = `Hi! I want to claim the ₹20,000 OFF coupon on solar installation.\n\nName: ${name}\nPhone: ${phone}`;
        const whatsappUrl = `https://wa.me/917350785606?text=${encodeURIComponent(msg)}`;

        hidePopup();
        sessionStorage.setItem('popupDismissed', 'true');
        window.open(whatsappUrl, '_blank');
    });
}

// Hero offer button & banner button open popup
if (heroOfferBtn) {
    heroOfferBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showPopup();
    });
}
if (offerBannerBtn) {
    offerBannerBtn.addEventListener('click', () => showPopup());
}

// ===== Mobile Menu =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
}

// ===== Navbar Scroll =====
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Scroll Animations =====
const observerOptions = { threshold: 0.08, rootMargin: '0px 0px -50px 0px' };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const animateElements = document.querySelectorAll(
    '.service-card, .service-detail-card, .benefit-item, .process-card, .stat-card, ' +
    '.hero-float-card, .project-card, .testimonial-card, .team-card, .value-card, ' +
    '.install-card, .timeline-item, .works-stat-card, .brand-card, .preview-card, ' +
    '.why-feature, .office-card'
);

animateElements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
    observer.observe(el);
});

// Animation class
const style = document.createElement('style');
style.textContent = `.animate-in { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// ===== Contact Form =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    // Auto-fill referral code from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
        const refInput = document.getElementById('referralCode');
        if (refInput) refInput.value = refCode;
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        // Save to Google Sheet
        saveToGoogleSheet({
            name: data.name || '',
            phone: data.phone || '',
            source: data.referralCode ? 'referral_' + data.referralCode : 'contact_form',
            email: data.email || '',
            area: data.area || '',
            bill: data.bill || '',
            propertyType: data.propertyType || '',
            message: data.message || '',
            referralCode: data.referralCode || ''
        });

        // If referral code provided, save as referral lead
        if (data.referralCode && data.referralCode.trim()) {
            const REFERRAL_LEADS_KEY = 'kalpdev_referral_leads';
            const leads = JSON.parse(localStorage.getItem(REFERRAL_LEADS_KEY) || '[]');
            leads.push({
                name: data.name || 'Unknown',
                phone: data.phone || '',
                email: data.email || '',
                area: data.area || '',
                bill: data.bill || '',
                propertyType: data.propertyType || '',
                referralCode: data.referralCode.trim().toUpperCase(),
                status: 'pending',
                date: new Date().toISOString(),
                message: data.message || ''
            });
            localStorage.setItem(REFERRAL_LEADS_KEY, JSON.stringify(leads));

            // Also save referral lead to Google Sheet
            saveToGoogleSheet({
                action: 'referral_lead',
                name: data.name || '',
                phone: data.phone || '',
                area: data.area || '',
                bill: data.bill || '',
                referralCode: data.referralCode.trim().toUpperCase(),
                referredBy: data.referralCode.trim().toUpperCase()
            });
        }

        let msg = `Hi! I'm interested in solar panel installation.\n`;
        if (data.name) msg += `Name: ${data.name}\n`;
        if (data.phone) msg += `Phone: ${data.phone}\n`;
        if (data.area) msg += `Area: ${data.area}\n`;
        if (data.bill) msg += `Monthly Bill: ₹${data.bill}\n`;
        if (data.propertyType) msg += `Property: ${data.propertyType}\n`;
        if (data.referralCode) msg += `Referral Code: ${data.referralCode}\n`;
        if (data.message) msg += `Message: ${data.message}\n`;

        const whatsappUrl = `https://wa.me/917350785606?text=${encodeURIComponent(msg)}`;
        alert('Thank you! Redirecting to WhatsApp for instant response...');
        window.open(whatsappUrl, '_blank');
        contactForm.reset();
    });
}

// ===== SAVINGS CALCULATOR =====
const calcBtn = document.getElementById('calcBtn');
const calcResults = document.getElementById('calcResults');
const calcBillInput = document.getElementById('calcBill');

if (calcBtn && calcResults) {
    calcBtn.addEventListener('click', () => {
        const bill = parseInt(calcBillInput.value);
        if (!bill || bill < 500) {
            alert('Please enter a valid monthly bill (minimum ₹500)');
            return;
        }

        // Corrected calculation for Pune/Maharashtra
        // Average tariff in Maharashtra: ~₹8-10/unit, using ₹9 avg
        const unitsPerMonth = Math.round(bill / 9);
        // 1kW generates ~130-140 units/month in Pune (good solar irradiance)
        const systemKW = Math.max(1, Math.round((unitsPerMonth / 135) * 10) / 10);
        const roundedKW = Math.ceil(systemKW); // Round up to nearest whole kW
        // Panels: 1 panel = ~550W (modern bifacial), so panels = kW * 1000 / 550
        const panels = Math.ceil(roundedKW * 1000 / 550);
        const monthlySaving = Math.round(bill * 0.85); // 85% realistic savings
        const yearlySaving = monthlySaving * 12;
        const lifetimeSaving = yearlySaving * 25;
        // Cost after subsidy: approx ₹45,000-50,000 per kW for residential
        const systemCost = roundedKW <= 3 ? roundedKW * 45000 : roundedKW * 50000;
        const paybackYears = Math.round((systemCost / yearlySaving) * 10) / 10;

        document.getElementById('calcSystem').textContent = roundedKW + ' kW (' + panels + ' panels)';
        document.getElementById('calcMonthlySaving').textContent = '₹' + monthlySaving.toLocaleString('en-IN');
        document.getElementById('calcYearlySaving').textContent = '₹' + yearlySaving.toLocaleString('en-IN');
        document.getElementById('calcLifetimeSaving').textContent = '₹' + lifetimeSaving.toLocaleString('en-IN');
        document.getElementById('calcPayback').textContent = paybackYears + ' years';

        calcResults.classList.remove('hidden');

        // Update WhatsApp link with bill amount
        const calcWhatsapp = document.getElementById('calcWhatsapp');
        if (calcWhatsapp) {
            const msg = `Hi! I want a detailed solar quote.\n\nMy monthly bill: ₹${bill}\nRecommended system: ${roundedKW}kW\nEstimated savings: ₹${yearlySaving.toLocaleString('en-IN')}/year`;
            calcWhatsapp.href = `https://wa.me/917350785606?text=${encodeURIComponent(msg)}`;
        }
    });

    // Allow Enter key
    if (calcBillInput) {
        calcBillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                calcBtn.click();
            }
        });
    }
}

// ===== FAQ ACCORDION =====
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close all
            faqItems.forEach(i => i.classList.remove('active'));
            // Open clicked (if it wasn't already open)
            if (!isActive) {
                item.classList.add('active');
            }
        });
    }
});

// ===== IMPACT COUNTER ANIMATION =====
const impactSection = document.querySelector('.powering-homes');
if (impactSection) {
    const impactObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numbers = entry.target.querySelectorAll('.impact-number');
                numbers.forEach(el => {
                    const target = parseInt(el.getAttribute('data-target'));
                    let current = 0;
                    const increment = target / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = Math.floor(current);
                    }, 30);
                });
                impactObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    impactObserver.observe(impactSection);
}

// ===== Counter Animation =====
function animateCounter(el, target, suffix = '') {
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = Math.floor(current) + suffix;
    }, 30);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(el => {
                const text = el.textContent.trim();
                if (text.includes('35')) animateCounter(el, 35, '+');
                else if (text.includes('100')) animateCounter(el, 100, '%');
                else el.textContent = '24/7';
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// Works page counters
const worksStats = document.querySelector('.works-stats');
if (worksStats) {
    const wsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const nums = entry.target.querySelectorAll('.ws-number');
                nums.forEach(el => {
                    const text = el.textContent.trim();
                    if (text.includes('500')) animateCounter(el, 500, '+');
                    else if (text.includes('5MW')) animateCounter(el, 5, 'MW+');
                    else if (text.includes('50')) animateCounter(el, 50, '+');
                    else el.textContent = '4.8★';
                });
                wsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    wsObserver.observe(worksStats);
}