// Main journal functionality for Lab 4
class JournalApp {
    constructor() {
        this.form = document.getElementById('journal-form');
        this.entriesContainer = document.getElementById('journal-entries');
        this.youtubeContainer = document.getElementById('youtube-videos');
        // COMPLETELY REMOVE the loadVideosBtn line

        this.init();
    }

    init() {
        this.loadEntries();
        this.setupEventListeners();
        this.requestNotificationPermission();
        this.loadYouTubeVideos(); // Load videos automatically
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        // COMPLETELY REMOVE the button event listener block
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
            alert('Please fill in both title and content fields.');
            return;
        }

        // Save to local storage
        const savedEntry = storage.saveEntry(entry);

        // Show success notification
        await browserAPI.showNotification('Entry Saved!', `"${entry.title}" has been saved successfully`);

        // Reload entries
        this.loadEntries();

        // Reset form
        this.form.reset();
        
        console.log('Journal entry saved:', savedEntry);
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

    loadEntries() {
        if (!this.entriesContainer) return;
        
        const entries = storage.getEntries();
        this.entriesContainer.innerHTML = '';

        if (entries.length === 0) {
            this.entriesContainer.innerHTML = '<p class="no-entries">No journal entries yet. Create your first entry above!</p>';
            return;
        }

        entries.forEach(entry => {
            const entryElement = this.createEntryElement(entry);
            this.entriesContainer.appendChild(entryElement);
        });
    }

    createEntryElement(entry) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry';
        entryDiv.innerHTML = `
            <h3>${entry.title}</h3>
            <p class="entry-date">${entry.date}</p>
            <p class="entry-content">${entry.content}</p>
            ${entry.tags && entry.tags.length ? `<p class="entry-tags">Tags: ${entry.tags.join(', ')}</p>` : ''}
            <div class="entry-actions">
                <button class="btn-copy" data-content="${this.formatContentForCopy(entry)}">Copy</button>
                <button class="btn-delete" data-id="${entry.id}">Delete</button>
            </div>
        `;

        // Add event listeners
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