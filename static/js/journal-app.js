// Main journal functionality for Lab 6 (Flask Backend Integration)
class JournalApp {
    constructor() {
        this.form = document.getElementById('journal-form');
        this.entriesContainer = document.getElementById('journal-entries');
        this.youtubeContainer = document.getElementById('youtube-videos');

        this.init();
    }

    async init() {
        await this.loadEntries();
        this.setupEventListeners();
        this.setupExportButton();
        this.requestNotificationPermission();
        this.loadYouTubeVideos();
    }

    setupEventListeners() {
        if (this.form) {
            // This event handler now contains logic for Flask submission and Local Storage fallback
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    setupExportButton() {
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAllEntries());
        }
    }

    // ADDED: Export all entries method (from Lab 5)
    async exportAllEntries() {
        try {
            const localStorageEntries = storage.getEntries();
            const jsonReflections = await this.fetchJsonReflections();
            
            const allEntries = {
                exportedAt: new Date().toISOString(),
                totalEntries: localStorageEntries.length + jsonReflections.length,
                localStorageEntries: localStorageEntries,
                serverReflections: jsonReflections 
            };
            
            const dataStr = JSON.stringify(allEntries, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = window.URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `journal-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            await browserAPI.showNotification('Export Successful', `Exported ${allEntries.totalEntries} entries!`);
        } catch (error) {
            console.error('Export failed:', error);
            browserAPI.showVisualFeedback('Export Failed', 'Could not export entries');
        }
    }

    // --- UPDATED: Handle form submission via Flask POST route ---
    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const title = formData.get('title');
        const content = formData.get('content');
        const tags = formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag);

        if (!title.trim() || !content.trim()) {
            browserAPI.showVisualFeedback('Validation Error', 'Please fill in both title and content fields.');
            return;
        }

        // Data payload structure that Flask expects
        const entry = { title, content, tags, reflection: content };
        
        let savedSuccessfully = false;

        // 1. Try to save via Flask POST route
        try {
            const response = await fetch("/api/reflections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry)
            });

            if (response.ok && response.status === 201) {
                // Flask saved successfully
                savedSuccessfully = true;
                browserAPI.showNotification('Entry Saved (Flask)!', `"${title}" saved to server.`);
            } else {
                 console.warn("Flask POST failed. Server returned non-201 status.", await response.text());
            }
        } catch (error) {
            console.error("Flask API call failed:", error);
        }

        // 2. Always save a copy locally (fallback)
        const savedEntry = storage.saveEntry(entry);
        if (!savedSuccessfully) {
            browserAPI.showNotification('Entry Saved (Local)!', `"${title}" saved locally only.`);
        }

        // Reload entries to see the new server data
        await this.loadEntries();

        this.form.reset();
    }
    // --- END UPDATED POST LOGIC ---

    // --- UPDATED: Fetch reflections from the Flask GET route ---
    async fetchJsonReflections() {
        try {
            // URL now points to the Flask API endpoint
            const response = await fetch("/api/reflections"); 
            
            if (!response.ok) {
                // If the Flask server is down or returns an error
                console.warn('Could not fetch Flask reflections. Showing local data only.');
                return []; 
            }
            
            const jsonReflections = await response.json();
            return jsonReflections;

        } catch (error) {
            console.error('Error fetching Flask reflections:', error);
            return [];
        }
    }
    // --- END UPDATED FETCH ---

    async loadEntries() { 
        if (!this.entriesContainer) return;

        const localStorageEntries = storage.getEntries();
        const jsonReflections = await this.fetchJsonReflections();

        // Map Flask/JSON data into PWA entry format
        const jsonEntries = jsonReflections.map(reflection => {
            const reflectionDate = new Date(reflection.date); 
            // Flask data is expected to have 'reflection' and 'date' fields
            return {
                id: reflection.date, 
                title: reflection.title || "Server Reflection Entry", 
                content: reflection.reflection,
                date: reflectionDate.toLocaleDateString() + ' @ ' + reflectionDate.toLocaleTimeString(),
                tags: ['flask', 'backend', 'live']
            };
        });

        // Combine all entries and sort
        const combinedEntries = [...localStorageEntries, ...jsonEntries];
        combinedEntries.sort((a, b) => new Date(b.date) - new Date(a.date)); 

        this.entriesContainer.innerHTML = '';

        // --- REFLECTION COUNTER ---
        const reflectionCountDiv = document.createElement('div');
        reflectionCountDiv.classList.add('reflection-counter');
        reflectionCountDiv.innerHTML = `<p class="subtitle">Total Server Reflections: <span id="reflection-count">${jsonReflections.length}</span></p>`;
        this.entriesContainer.appendChild(reflectionCountDiv);
        // --- END COUNTER ---

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

            // Using mock data for reliable demonstration
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
                                src="${youtubeAPI.getEmbedUrl(video.id)}" 
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
        const isLocalStorage = typeof entry.id === 'number';

        entryDiv.className = 'journal-entry';
        if (!isLocalStorage) {
            entryDiv.classList.add('python-entry'); // Uses python-entry class for server-saved data
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
                    <p class="python-label">Saved via Flask Backend</p>
                </div>
            `}
        `;

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
