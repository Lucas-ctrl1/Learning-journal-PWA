// ===== REUSABLE NAVIGATION (UPDATED FOR FLASK ROUTES) =====
function loadNavigation() {
    // Check if navigation already exists
    if (document.querySelector('nav')) {
        return;
    }
    
    // NOTE: Links are updated to use Flask routes (e.g., /journal) for navigation
    const navHTML = `
    <nav>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/journal">Journal</a></li>
            <li><a href="/projects">Projects</a></li>
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

// ===== HIGHLIGHT ACTIVE PAGE (UPDATED FOR FLASK ROUTES) =====
function highlightActivePage() {
    // Get the current path (e.g., '/', '/journal', '/about')
    let currentPath = window.location.pathname.replace(/\/$/, '');
    if (currentPath === '') {
        currentPath = '/'; // Ensure homepage is correctly detected
    }

    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // Check if the link href matches the current path exactly
        if (linkHref === currentPath) {
            link.style.background = '#34495e';
            link.style.fontWeight = 'bold';
        } else if (linkHref === '/' && currentPath.includes('index')) {
             // Handle case where index page might be accessed via /index
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
