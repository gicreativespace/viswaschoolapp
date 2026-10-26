// ==========================================
// IMPORT SECTION-SPECIFIC LOGIC
// ==========================================
import './auth.js';
import './admin.js';
import './incharge.js';
import './parent.js';

// ==========================================
// 1. SECTION NAVIGATION
// ==========================================
window.showSection = function(sectionId) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`section-${sectionId}`);
    if (targetSection) targetSection.classList.add('active');
    
    // Load section-specific data after a short delay
    setTimeout(() => {
        if (sectionId === 'principal-dashboard' && window.loadApprovals) window.loadApprovals();
        if (sectionId === 'attendance' && window.loadStudents) window.loadStudents();
        if (sectionId === 'e-diary' && window.loadSubjects) window.loadSubjects();
        if (sectionId === 'parent-dashboard' && window.loadParentDashboard) window.loadParentDashboard();
        if (sectionId === 'poster-generator' && window.drawPoster) window.drawPoster();
    }, 100);
};

// ==========================================
// 2. STARTUP & SPLASH SCREEN
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const splash = document.getElementById('global-splash');
        if (splash) splash.classList.add('hidden');
    }, 1500);

    // Apply saved dark mode
    if (localStorage.getItem('sv_dark_mode') === 'true') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('dark-mode-toggle-icon');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
});

// ==========================================
// 3. DARK MODE TOGGLE
// ==========================================
window.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('sv_dark_mode', isDark);
    
    const icon = document.getElementById('dark-mode-toggle-icon');
    if (icon) {
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
};

// ==========================================
// 4. FOOTER LOGIC (Single Click vs Long Press)
// ==========================================
let pressTimer;
let isLongPress = false;

const footerText = document.getElementById('gi-footer-text');

const startPress = (e) => {
    e.preventDefault();
    isLongPress = false;
    pressTimer = setTimeout(() => {
        isLongPress = true;
        // Long Press (3 seconds) -> Open GI Admin Login
        alert("GI Super Admin Login (Phase 3)");
        pressTimer = null;
    }, 3000);
};

const cancelPress = () => {
    if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
        if (!isLongPress) {
            // Single Click -> Open Popup
            document.getElementById('gi-popup').classList.add('active');
        }
    }
};

if (footerText) {
    footerText.addEventListener('mousedown', startPress);
    footerText.addEventListener('mouseup', cancelPress);
    footerText.addEventListener('mouseleave', () => { 
        if(pressTimer) clearTimeout(pressTimer); 
    });
    footerText.addEventListener('touchstart', startPress, {passive: false});
    footerText.addEventListener('touchend', cancelPress);
}

// ==========================================
// 5. GI POPUP
// ==========================================
window.openGiPopup = () => document.getElementById('gi-popup').classList.add('active');
window.closeGiPopup = () => document.getElementById('gi-popup').classList.remove('active');

// ==========================================
// 6. PWA INSTALL LOGIC
// ==========================================
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('show');
});

document.addEventListener('DOMContentLoaded', () => {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                await deferredPrompt.userChoice;
                deferredPrompt = null;
                document.getElementById('install-banner').classList.remove('show');
            }
        });
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.remove('show');
    deferredPrompt = null;
});
