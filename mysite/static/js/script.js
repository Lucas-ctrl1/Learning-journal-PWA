
// 1. GLOBAL STATE - Check hardware status immediately before anything else runs
let isCurrentlyOffline = !navigator.onLine;

// ===== 1. LAB 7: ENHANCED INSTANT OFFLINE HEARTBEAT =====

async function checkConnectivity() {
    const container = document.querySelector('.container');
    const dot = document.getElementById('heartbeat-dot');
    const statusText = document.getElementById('status-text');

    // Immediate fail if hardware reports offline
    if (!navigator.onLine) {
        setOfflineUI(true, container, dot, statusText);
        return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    try {
        const response = await fetch("/api/reflections", {
            method: 'HEAD',
            signal: controller.signal,
            cache: 'no-store' // Critical: forces browser to ignore SW cache
        });
        clearTimeout(timeoutId);
        setOfflineUI(!response.ok, container, dot, statusText);
    } catch (error) {
        // If fetch is aborted or fails, we are offline
        setOfflineUI(true, container, dot, statusText);
    }
}

function setOfflineUI(isOffline, container, dot, statusText) {
    isCurrentlyOffline = isOffline;
    if (isOffline) {
        if (container) container.classList.add('offline-mode');
        if (dot) { dot.classList.add('dot-offline'); dot.classList.remove('pulse'); }
        if (statusText) statusText.innerText = "Offline";
    } else {
        if (container) container.classList.remove('offline-mode');
        if (dot) { dot.classList.remove('dot-offline'); dot.classList.add('pulse'); }
        if (statusText) statusText.innerText = "Online";
    }
}

// ===== 2. NAVIGATION & PROGRESS BAR =====
function loadNavigation() {
    if (document.querySelector('nav')) return;

    // Build nav with initial offline state if hardware already says so
    const navHTML = `
    <div id="scroll-progress-container" style="position: fixed; top: 0; width: 100%; height: 4px; background: transparent; z-index: 10001;">
        <div id="scroll-progress-bar" style="height: 100%; background: #3498db; width: 0%; transition: width 0.1s ease; box-shadow: 0 0 10px #3498db;"></div>
    </div>
    <nav>
        <div class="status-indicator">
            <span id="heartbeat-dot" class="status-dot ${isCurrentlyOffline ? 'dot-offline' : 'pulse'}"></span>
            <span id="status-text">${isCurrentlyOffline ? 'Offline' : 'Online'}</span>
        </div>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/journal">Journal</a></li>
            <li><a href="/projects">Projects</a></li>
            <li><a href="/game">Snake</a></li>
        </ul>
        <button id="dark-mode-toggle">🌙 Dark Mode</button>
    </nav>`;

    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Apply grayscale immediately if global state is offline
    if (isCurrentlyOffline) {
        const container = document.querySelector('.container');
        if (container) container.classList.add('offline-mode');
    }
}

// ===== 3. DYNAMIC HOME DASHBOARD =====
async function initHomeDashboard() {
    const localData = localStorage.getItem("learningJournalEntries");
    const localEntries = localData ? JSON.parse(localData) : [];
    const highScore = localStorage.getItem("snakeHighScore") || 0;

    let serverEntries = [];
    try {
        const response = await fetch("/api/reflections", { cache: 'no-store' });
        if (response.ok) serverEntries = await response.json();
    } catch (error) {
        console.warn("Dashboard sync deferred - offline.");
    }

    const highScoreDisplay = document.getElementById('home-high-score');
    const entryCountDisplay = document.getElementById('home-reflection-count');
    const previewSection = document.getElementById('recent-preview-section');
    const previewText = document.getElementById('recent-preview-text');

    if (highScoreDisplay) highScoreDisplay.innerText = highScore;
    if (entryCountDisplay) entryCountDisplay.innerText = serverEntries.length + localEntries.length;

    if (previewSection && previewText) {
        previewSection.style.display = 'block';
        if (localEntries.length > 0) {
            const latestLocal = localEntries[0].content || localEntries[0].reflection;
            previewText.innerText = '"' + latestLocal.substring(0, 120) + '..."';
        } else if (serverEntries.length > 0) {
            const latestServer = serverEntries[serverEntries.length - 1];
            previewText.innerText = '"' + latestServer.reflection.substring(0, 120) + '..."';
        }
    }
}

// ===== 4. UI UTILITIES =====
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
        if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');
    }
}

function highlightActivePage() {
    let path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === path) link.classList.add('active-nav');
    });
}

// ===== 5. SERVICE WORKER REGISTRATION =====
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('✅ SW Active'))
                .catch(err => console.log('❌ SW Failed', err));
        });
    }
}

// ===== 6. INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Navigation with current offline state applied
    loadNavigation();

    // 2. Perform Heartbeat immediately to update UI if status changed
    checkConnectivity();

    // 3. Other initializations
    highlightActivePage();
    updateLiveDate();
    initDarkMode();
    initHomeDashboard();
    registerServiceWorker();

    // 4. Setup listeners & Heartbeat (3s interval)
    window.addEventListener('online', checkConnectivity);
    window.addEventListener('offline', checkConnectivity);
    setInterval(checkConnectivity, 3000);
    setInterval(updateLiveDate, 1000);
});
