// ===== REUSABLE NAVIGATION =====
function loadNavigation() {
    // Check if navigation already exists
    if (document.querySelector('nav')) {
        return;
    }
    
    const navHTML = `
    <nav>
        <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="journal.html">Journal</a></li>
            <li><a href="projects.html">Projects</a></li>
        </ul>
        <button id="dark-mode-toggle">🌙 Dark Mode</button>
    </nav>
    `;
    
    // Insert navigation at the very beginning of body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// ===== LIVE DATE =====
function updateLiveDate() {
    const dateElement = document.getElementById('live-date');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString() + ' • ' + now.toLocaleTimeString();
    }
}

// ===== DARK MODE TOGGLE =====
function initDarkMode() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            // Save preference to localStorage
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
        
        // Load saved preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
}

// ===== HIGHLIGHT ACTIVE PAGE =====
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.style.background = '#34495e';
            link.style.fontWeight = 'bold';
        }
    });
}

// ===== INITIALIZE EVERYTHING =====
function initializeAll() {
    console.log('Initializing navigation and features...');
    
    // Load navigation first
    loadNavigation();
    
    // Then highlight the active page
    highlightActivePage();
    
    // Then initialize other features
    updateLiveDate();
    initDarkMode();
    
    // Set up intervals
    setInterval(updateLiveDate, 1000);
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
} else {
    // DOM is already ready
    initializeAll();
}