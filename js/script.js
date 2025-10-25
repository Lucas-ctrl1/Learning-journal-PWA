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

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', function() {
    loadNavigation();
    updateLiveDate();
    setInterval(updateLiveDate, 1000);
});