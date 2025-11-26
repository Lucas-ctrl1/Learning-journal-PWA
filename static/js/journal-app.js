// Main journal functionality for Lab 6 (Flask Backend Integration)
class JournalApp {
    constructor() {
        this.form = document.getElementById('journal-form');
        this.entriesContainer = document.getElementById('journal-entries');
        // REMOVED: youtubeContainer - handled by thirdparty.js

        this.init();
    }

    async init() {
        await this.loadEntries();
        this.setupEventListeners();
        this.setupExportButton();
        this.requestNotificationPermission();
        // REMOVED: loadYouTubeVideos() - handled by thirdparty.js
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    setupExportButton() {
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAllEntries());
        }
    }

    // Export all entries method
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

    // Delete Flask entries
    async deleteFlaskReflection(index) {
        try {
            const response = await fetch(`/api/reflections/${index}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await this.loadEntries();
                browserAPI.showNotification('Entry Deleted', 'Server entry has been removed');
            } else {
                alert('Error deleting entry from server');
            }
        } catch (error) {
            console.error('Delete error:', error);
            browserAPI.showVisualFeedback('Delete Failed', 'Could not delete from server');
        }
    }

    // Handle form submission via Flask POST route
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
                savedSuccessfully = true;
                browserAPI.showNotification('Entry Saved (Flask)!', `"${title}" saved to server.`);
            } else {
                 console.warn("Flask POST failed.", await response.text());
            }
        } catch (error) {
            console.error("Flask API call failed:", error);
        }

        // 2. Always save a copy locally (fallback)
        storage.saveEntry(entry);
        if (!savedSuccessfully) {
            browserAPI.showNotification('Entry Saved (Local)!', `"${title}" saved locally only.`);
        }

        await this.loadEntries();
        this.form.reset();
    }

    // Fetch reflections from Flask GET route
    async fetchJsonReflections() {
        try {
            const response = await fetch("/api/reflections");
            if (!response.ok) {
                console.warn('Could not fetch Flask reflections. Showing local data only.');
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching Flask reflections:', error);
            return [];
        }
    }

    async loadEntries() {
        if (!this.entriesContainer) return;

        const localStorageEntries = storage.getEntries();
        const jsonReflections = await this.fetchJsonReflections();

        // Map Flask data into PWA entry format
        const jsonEntries = jsonReflections.map((reflection, index) => {
            const reflectionDate = new Date(reflection.date); 
            return {
                id: reflection.date, 
                title: reflection.title || "Server Reflection Entry", 
                content: reflection.reflection,
                date: reflectionDate.toLocaleDateString() + ' @ ' + reflectionDate.toLocaleTimeString(),
                tags: ['flask', 'backend', 'live'],
                flaskIndex: index
            };
        });

        // Combine all entries and sort
        const combinedEntries = [...localStorageEntries, ...jsonEntries];
        combinedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        this.entriesContainer.innerHTML = '';

        // Reflection Counter
        const reflectionCountDiv = document.createElement('div');
        reflectionCountDiv.classList.add('reflection-counter');
        reflectionCountDiv.innerHTML = `<p class="subtitle">Total Server Reflections: <span id="reflection-count">${jsonReflections.length}</span></p>`;
        this.entriesContainer.appendChild(reflectionCountDiv);

        if (combinedEntries.length === 0) {
            this.entriesContainer.innerHTML += '<p class="no-entries">No journal entries yet. Create your first entry above!</p>';
            return;
        }

        combinedEntries.forEach(entry => {
            const entryElement = this.createEntryElement(entry);
            this.entriesContainer.appendChild(entryElement);
        });
    }

    createEntryElement(entry) {
        const entryDiv = document.createElement('div');
        const isLocalStorage = typeof entry.id === 'number';

        entryDiv.className = 'journal-entry';
        if (!isLocalStorage) {
            entryDiv.classList.add('python-entry');
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
                    <button class="btn-delete-flask" data-index="${entry.flaskIndex}">Delete from Server</button>
                </div>
            `}
        `;

        // Event listeners for Local Storage entries
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

        // Event listener for Flask entry delete buttons
        const flaskDeleteBtn = entryDiv.querySelector('.btn-delete-flask');
        if (flaskDeleteBtn) {
            flaskDeleteBtn.addEventListener('click', async (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                if (confirm('Are you sure you want to delete this entry from the server?')) {
                    await this.deleteFlaskReflection(index);
                }
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