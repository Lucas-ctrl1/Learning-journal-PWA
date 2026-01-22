

// ===== 1. NAVIGATION & PROGRESS BAR =====
function loadNavigation() {
    if (document.querySelector('nav')) return;

    const navHTML = `
    <div id="scroll-progress-container" style="position: fixed; top: 0; width: 100%; height: 4px; background: transparent; z-index: 10001;">
        <div id="scroll-progress-bar" style="height: 100%; background: #3498db; width: 0%; transition: width 0.1s ease; box-shadow: 0 0 10px #3498db;"></div>
    </div>
    <nav>
        <div class="status-indicator">
            <span id="heartbeat-dot" class="status-dot pulse"></span>
            <span id="status-text">Online</span>
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
}

// ===== 2. DYNAMIC HOME DASHBOARD (Dynamic Sync) =====
async function initHomeDashboard() {
    const localData = localStorage.getItem("learningJournalEntries");
    const localEntries = localData ? JSON.parse(localData) : [];
    const highScore = localStorage.getItem("snakeHighScore") || 0;

    let serverEntries = [];
    try {
        const response = await fetch("/api/reflections");
        if (response.ok) {
            serverEntries = await response.json();
        }
    } catch (error) {
        console.warn("Dashboard server fetch failed.");
    }

    const highScoreDisplay = document.getElementById('home-high-score');
    const entryCountDisplay = document.getElementById('home-reflection-count');
    const previewSection = document.getElementById('recent-preview-section');
    const previewText = document.getElementById('recent-preview-text');

    if (highScoreDisplay) highScoreDisplay.innerText = highScore;
    if (entryCountDisplay) {
        entryCountDisplay.innerText = serverEntries.length + localEntries.length;
    }

    if (previewSection && previewText) {
        previewSection.style.display = 'block';
        if (localEntries.length > 0) {
            const latestLocal = localEntries[0].content || localEntries[0].reflection;
            previewText.innerText = `"${latestLocal.substring(0, 120)}..."`;
        } else if (serverEntries.length > 0) {
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

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const scrollBar = document.getElementById("scroll-progress-bar");
    if (scrollBar) scrollBar.style.width = scrolled + "%";
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

// ===== 4. LAB 7: ENHANCED OFFLINE HEARTBEAT WITH VISUAL DOT =====
async function initNetworkStatus() {
    const container = document.querySelector('.container');
    const dot = document.getElementById('heartbeat-dot');
    const statusText = document.getElementById('status-text');

    async function checkConnectivity() {
        if (!navigator.onLine) {
            setOfflineUI(true);
            return;
        }

        try {
            // "True Heartbeat" check
            const response = await fetch("/api/reflections", { method: 'HEAD' });
            setOfflineUI(!response.ok);
        } catch (error) {
            setOfflineUI(true);
        }
    }

    function setOfflineUI(isOffline) {
        if (isOffline) {
            if (container) container.classList.add('offline-mode');
            if (dot) {
                dot.classList.add('dot-offline');
                dot.classList.remove('pulse');
            }
            if (statusText) statusText.innerText = "Offline";
        } else {
            if (container) container.classList.remove('offline-mode');
            if (dot) {
                dot.classList.remove('dot-offline');
                dot.classList.add('pulse');
            }
            if (statusText) statusText.innerText = "Online";
        }
    }

    window.addEventListener('online', checkConnectivity);
    window.addEventListener('offline', checkConnectivity);
    setInterval(checkConnectivity, 5000); // Heartbeat interval
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
    initHomeDashboard();
    registerServiceWorker();
    initNetworkStatus();
    setInterval(updateLiveDate, 1000);
});
