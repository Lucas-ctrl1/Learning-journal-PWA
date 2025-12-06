// ===== REUSABLE NAVIGATION =====
function loadNavigation() {
    // Prevent duplicate navigation bars
    if (document.querySelector('nav')) return;

    const navHTML = `
    <nav>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/journal">Journal</a></li>
            <li><a href="/projects">Projects</a></li>
        </ul>
        <button id="dark-mode-toggle">🌙 Dark Mode</button>
    </nav>`;

    // Insert at the top of the body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// ===== UTILITY: Show Toast Notification (Built-in) =====
// This ensures notifications work on ALL pages without needing extra files
function showToast(title, message, color = '#27ae60') {
    // Remove existing toast if any
    const existingToast = document.getElementById('offline-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'offline-toast';
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
        font-size: 14px;
        animation: fadeIn 0.5s;
    `;

    toast.innerHTML = `<strong>${title}</strong><br>${message}`;
    document.body.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// ===== LAB 7: ROBUST OFFLINE DETECTION (With Heartbeat) =====
function initNetworkStatus() {
    const container = document.querySelector('.container');

    // 1. Core Logic to Toggle UI
    function setOfflineMode(isOffline) {
        // Prevent unnecessary UI updates if state hasn't changed
        // This stops the notification from popping up every 3 seconds if nothing changed
        const currentStatus = container && container.classList.contains('offline-mode');
        if (isOffline === currentStatus) return;

        if (isOffline) {
            console.log("⚠️ Application is Offline");
            // Add Grayscale Effect
            if (container) container.classList.add('offline-mode');
            // Show Red Notification
            showToast('⚠️ You are Offline', 'Viewing cached version.', '#e74c3c');
        } else {
            console.log("✅ Application is Online");
            // Remove Grayscale Effect
            if (container) container.classList.remove('offline-mode');
            // Show Green Notification
            showToast('✅ Back Online', 'Connection restored.', '#27ae60');
        }
    }

    // 2. Check immediately on load
    if (!navigator.onLine) {
        setOfflineMode(true);
    }

    // 3. Listen for Event Changes (The Standard Way)
    window.addEventListener('offline', () => setOfflineMode(true));
    window.addEventListener('online', () => setOfflineMode(false));

    // 4. THE HEARTBEAT FIX (The "Glitch" Killer)
    // Checks connection every 3 seconds just in case the browser "forgot" to tell us.
    setInterval(() => {
        if (navigator.onLine) {
            setOfflineMode(false);
        } else {
            setOfflineMode(true);
        }
    }, 3000);
}

// ===== STANDARD FEATURES =====
function updateLiveDate() {
    const el = document.getElementById('live-date');
    if (el) el.innerText = new Date().toLocaleString();
}

function initDarkMode() {
    const btn = document.getElementById('dark-mode-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });

        // Load saved preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
}

// ===== LAB 7: SERVICE WORKER REGISTRATION =====
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('✅ SW Registered'))
                .catch(err => console.log('❌ SW Failed', err));
        });
    }
}

function highlightActivePage() {
    // Get current path, ensuring homepage '/' is handled correctly
    let path = window.location.pathname.replace(/\/$/, '') || '/';

    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        // Match path or handle index cases
        if (href === path || (path === '/' && href === '/')) {
            link.style.background = '#34495e';
            link.style.fontWeight = 'bold';
        }
    });
}

// ===== INITIALIZE ALL =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing App...');
    loadNavigation();
    highlightActivePage();
    updateLiveDate();
    initDarkMode();

    registerServiceWorker(); // Lab 7 Requirement
    initNetworkStatus();     // Lab 7 Extra Feature

    // Update date every second
    setInterval(updateLiveDate, 1000);
});
