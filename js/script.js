// ===== REUSABLE NAVIGATION =====
function loadNavigation() {
    const navHTML = `
    <nav>
        <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="journal.html">Journal</a></li>
            <li><a href="projects.html">Projects</a></li>
        </ul>
    </nav>
    `;
    
    // Insert navigation at the start of body
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

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', function() {
    loadNavigation();
    updateLiveDate();
    setInterval(updateLiveDate, 1000);
});