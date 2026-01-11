/**
 * script.js - Final Robust Version for Lab 7
 * Handles: Navigation, Dashboard Sync (Server + Local),
 * Dark Mode, Scroll Progress, and Offline Heartbeat.
 */

// ===== 1. NAVIGATION & PROGRESS BAR =====
function loadNavigation() {
    if (document.querySelector('nav')) return;

    const navHTML = `
    <div id="scroll-progress-container" style="position: fixed; top: 0; width: 100%; height: 4px; background: transparent; z-index: 10001;">
        <div id="scroll-progress-bar" style="height: 100%; background: #3498db; width: 0%; transition: width 0.1s ease; box-shadow: 0 0 10px #3498db;"></div>
    </div>
    <nav>
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
}

// ===== 2. DYNAMIC HOME DASHBOARD (Dynamic Sync) =====
/**
 * Fetches real entries from reflections.json and local storage.
 * Displays the absolute latest entry from either source as the preview.
 */
async function initHomeDashboard() {
    // 1. Get dynamic local entries
    const localData = localStorage.getItem("learningJournalEntries");
    const localEntries = localData ? JSON.parse(localData) : [];
    const highScore = localStorage.getItem("snakeHighScore") || 0;

    // 2. Fetch server-side reflections (from reflections.json)
    let serverEntries = [];
    try {
        const response = await fetch("/api/reflections");
        if (response.ok) {
            serverEntries = await response.json();
        }
    } catch (error) {
        console.warn("Dashboard server fetch failed.");
    }

    // 3. Target homepage elements
    const highScoreDisplay = document.getElementById('home-high-score');
    const entryCountDisplay = document.getElementById('home-reflection-count');
    const previewSection = document.getElementById('recent-preview-section');
    const previewText = document.getElementById('recent-preview-text');

    // 4. Update the Numbers: Server + Local
    if (highScoreDisplay) highScoreDisplay.innerText = highScore;
    if (entryCountDisplay) {
        entryCountDisplay.innerText = serverEntries.length + localEntries.length;
    }

    // 5. Populate Preview with the ACTUAL latest entry
    if (previewSection && previewText) {
        previewSection.style.display = 'block';

        if (localEntries.length > 0) {
            // Prioritize newest local entry if it exists
            const latestLocal = localEntries[0].content || localEntries[0].reflection;
            previewText.innerText = `"${latestLocal.substring(0, 120)}..."`;
        } else if (serverEntries.length > 0) {
            // Fallback: Use the very last entry in your reflections.json
            const latestServer = serverEntries[serverEntries.length - 1];
            const content = latestServer.reflection || latestServer.content || "No content found";
            previewText.innerText = `"${content.substring(0, 120)}..."`;
        } else {
            previewText.innerText = "Start your learning journey by adding your first reflection!";
        }
    }
}

// ===== 3. UI UTILITIES & DARK MODE =====
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
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
}

// Scroll progress bar logic
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const scrollBar = document.getElementById("scroll-progress-bar");
    if (scrollBar) {
        scrollBar.style.width = scrolled + "%";
    }
});

function highlightActivePage() {
    let path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === path || (path === '/' && href === '/')) {
            link.classList.add('active-nav');
        }
    });
}

// ===== 4. LAB 7: OFFLINE HEARTBEAT =====
function initNetworkStatus() {
    const container = document.querySelector('.container');
    function updateStatus() {
        if (!navigator.onLine) {
            if (container) container.classList.add('offline-mode');
        } else {
            if (container) container.classList.remove('offline-mode');
        }
    }
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    setInterval(updateStatus, 3000);
}

// ===== 5. SERVICE WORKER REGISTRATION =====
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('✅ Service Worker Active'))
                .catch(err => console.log('❌ SW Registration Failed', err));
        });
    }
}

// ===== 6. INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    loadNavigation();
    highlightActivePage();
    updateLiveDate();
    initDarkMode();
    initHomeDashboard(); // Fetches real server data for count and preview
    registerServiceWorker();
    initNetworkStatus();
    setInterval(updateLiveDate, 1000);
});
