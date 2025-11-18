// Main journal functionality for Lab 4 & Lab 5 (Python/JSON Integration)
class JournalApp {
    constructor() {
        this.form = document.getElementById('journal-form');
        this.entriesContainer = document.getElementById('journal-entries');
        this.youtubeContainer = document.getElementById('youtube-videos');
        // The loadVideosBtn line was previously removed

        this.init();
    }

    async init() { // MADE ASYNC
        await this.loadEntries(); // ADDED AWAIT
        this.setupEventListeners();
        this.requestNotificationPermission();
        this.loadYouTubeVideos(); // Load videos automatically
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const entry = {
            title: formData.get('title'),
            content: formData.get('content'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        // Validate required fields
        if (!entry.title.trim() || !entry.content.trim()) {
            // Note: browserAPI.showVisualFeedback is used instead of alert()
            browserAPI.showVisualFeedback('Validation Error', 'Please fill in both title and content fields.');
            return;
        }

        // Save to local storage
        const savedEntry = storage.saveEntry(entry);

        // Show success notification
        await browserAPI.showNotification('Entry Saved!', `"${entry.title}" has been saved successfully`);

        // Reload entries
        await this.loadEntries(); // ADDED AWAIT

        // Reset form
        this.form.reset();
        
        console.log('Journal entry saved:', savedEntry);
    }

    // NEW FUNCTION: Fetch reflections from the Python/JSON backend
    async fetchJsonReflections() {
        try {
            // Path: /backend/reflections.json (relative to journal.html)
            const response = await fetch("backend/reflections.json");
            
            if (!response.ok) {
                console.warn('Could not fetch JSON reflections. Using Local Storage only.');
                return []; 
            }
            
            const jsonReflections = await response.json();
            return jsonReflections;
            
        } catch (error) {
            console.error('Error fetching JSON reflections:', error);
            return [];
        }
    }

    async loadEntries() { 
        if (!this.entriesContainer) return;
        
        // 1. Get entries from Local Storage (your existing data)
        const localStorageEntries = storage.getEntries();
        
        // 2. Get entries from JSON file (new data from Python)
        const jsonReflections = await this.fetchJsonReflections();
        
        // 3. Combine and transform JSON reflections into journal entry format
        const jsonEntries = jsonReflections.map(reflection => {
            const reflectionDate = new Date(reflection.date); 
            
            return {
                // Using date string as ID. This also flags it as a non-Local Storage entry.
                id: reflection.date, 
                title: "Python Reflection Entry", 
                content: reflection.reflection,
                date: reflectionDate.toLocaleDateString() + ' @ ' + reflectionDate.toLocaleTimeString(),
                tags: ['python', 'json', 'backend']
            };
        });
        
        // Combine all entries
        const combinedEntries = [...localStorageEntries, ...jsonEntries];
        
        // Sort by date (newest first)
        combinedEntries.sort((a, b) => new Date(b.date) - new Date(a.date)); 
        
        this.entriesContainer.innerHTML = '';

        // --- LAB 5 EXTRA FEATURE: Reflection Counter (Cleaned Markup) ---
        const reflectionCountDiv = document.createElement('div');
        reflectionCountDiv.innerHTML = `<p class="subtitle">Total Backend JSON Reflections: <span id="reflection-count">${jsonReflections.length}</span></p>`;
        this.entriesContainer.appendChild(reflectionCountDiv);
        // --- END EXTRA FEATURE ---

        if (combinedEntries.length === 0) {
            this.entriesContainer.innerHTML += '<p class="no-entries">No journal entries yet. Create your first entry above!</p>';
            return;
        }

        combinedEntries.forEach(entry => {
            const entryElement = this.createEntryElement(entry);
            this.entriesContainer.appendChild(entryElement);
        });
    }
    
    // YouTube API Integration with EMBEDDED VIDEOS
    async loadYouTubeVideos() {
        if (!this.youtubeContainer) return;

        try {
            this.youtubeContainer.innerHTML = '<p>Loading programming videos...</p>';
            
            const videos = await youtubeAPI.searchVideos('mobile development programming', 3);
            
            this.displayYouTubeVideos(videos);
            
        } catch (error) {
            console.error('Failed to load videos:', error);
            this.youtubeContainer.innerHTML = '<p>Unable to load videos. Please try again later.</p>';
        }
    }

    displayYouTubeVideos(videos) {
        this.youtubeContainer.innerHTML = `
            <h3>🎬 Embedded Programming Videos</h3>
            <div class="videos-grid">
                ${videos.map(video => `
                    <div class="video-card">
                        <div class="video-embed">
                            <iframe 
                                width="100%" 
                                height="200" 
                                src="https://www.youtube.com/embed/${video.id}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                        <div class="video-info">
                            <h4>${video.title}</h4>
                            <p class="video-channel">${video.channel}</p>
                            <p class="video-date">${video.publishedAt}</p>
                            <a href="${youtubeAPI.getWatchUrl(video.id)}" target="_blank" class="video-link">Watch on YouTube</a>
                        </div>
                    </div>
                `).join('')}
            </div>
            <p class="video-note"><small>Videos embedded using YouTube Data API</small></p>
        `;
    }
    
    createEntryElement(entry) {
        const entryDiv = document.createElement('div');
        
        // Check if the entry is from Local Storage (has a numeric ID) or JSON (has a string ID/date)
        const isLocalStorage = typeof entry.id === 'number';

        entryDiv.className = 'journal-entry';
        if (!isLocalStorage) {
            entryDiv.classList.add('python-entry'); // Added unique class for styling
        }
        
        entryDiv.innerHTML = `
            <h3>${entry.title}</h3>
            <p class="entry-date">${entry.date}</p>
            <p class="entry-content">${entry.content}</p>
            ${entry.tags && entry.tags.length ? `<p class="entry-tags">Tags: ${entry.tags.join(', ')}</p>` : ''}
            
            ${isLocalStorage ? `
                <div class="entry-actions">
                    <button class="btn-copy" data-content="${this.formatContentForCopy(entry)}">Copy</button>
                    <button class="btn-delete" data-id="${entry.id}">Delete</button>
                </div>
            ` : `
                <div class="entry-actions">
                    <p class="python-label">Saved via Python Backend</p>
                </div>
            `}
        `;

        // Only attach listeners if it's a Local Storage entry
        if (isLocalStorage) {
            entryDiv.querySelector('.btn-copy').addEventListener('click', (e) => {
                const content = e.target.getAttribute('data-content');
                browserAPI.copyToClipboard(content);
            });

            entryDiv.querySelector('.btn-delete').addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                storage.deleteEntry(id);
                this.loadEntries();
                browserAPI.showNotification('Entry Deleted', 'Journal entry has been removed');
            });
        }

        return entryDiv;
    }

    formatContentForCopy(entry) {
        return `${entry.title}\nDate: ${entry.date}\n\n${entry.content}\n\nTags: ${entry.tags?.join(', ') || 'None'}`;
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JournalApp();
});