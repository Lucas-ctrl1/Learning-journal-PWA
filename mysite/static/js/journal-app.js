// Main journal functionality for Lab 6 & 7
class JournalApp {
    constructor() {
        this.form = document.getElementById('journal-form');
        this.entriesContainer = document.getElementById('journal-entries');
        this.init();
    }

    async init() {
        await this.loadEntries();
        this.setupEventListeners();
        this.setupExportButton();
        // REMOVED: requestNotificationPermission - now handled globally in script.js
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

        try {
            const response = await fetch("/api/reflections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry)
            });

            if (response.ok && response.status === 201) {
                savedSuccessfully = true;
                browserAPI.showNotification('Entry Saved (Flask)!', `"${title}" saved to server.`);
            }
        } catch (error) {
            console.error("Flask API call failed:", error);
        }

        storage.saveEntry(entry);
        if (!savedSuccessfully) {
            browserAPI.showNotification('Entry Saved (Local)!', `"${title}" saved locally only.`);
        }

        await this.loadEntries();
        this.form.reset();
    }

    async fetchJsonReflections() {
        try {
            const response = await fetch("/api/reflections");
            return response.ok ? await response.json() : [];
        } catch (error) {
            return [];
        }
    }

    async loadEntries() {
        if (!this.entriesContainer) return;
        const localStorageEntries = storage.getEntries();
        const jsonReflections = await this.fetchJsonReflections();

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

        const combinedEntries = [...localStorageEntries, ...jsonEntries];
        combinedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        this.entriesContainer.innerHTML = '';
        const countDiv = document.createElement('div');
        countDiv.classList.add('reflection-counter');
        countDiv.innerHTML = `<p class="subtitle">Total Server Reflections: <span id="reflection-count">${jsonReflections.length}</span></p>`;
        this.entriesContainer.appendChild(countDiv);

        if (combinedEntries.length === 0) {
            this.entriesContainer.innerHTML += '<p class="no-entries">No journal entries yet.</p>';
            return;
        }

        combinedEntries.forEach(entry => this.entriesContainer.appendChild(this.createEntryElement(entry)));
    }

    createEntryElement(entry) {
        const entryDiv = document.createElement('div');
        const isLocalStorage = typeof entry.id === 'number';
        entryDiv.className = isLocalStorage ? 'journal-entry' : 'journal-entry python-entry';

        entryDiv.innerHTML = `
            <h3>${entry.title}</h3>
            <p class="entry-date">${entry.date}</p>
            <p class="entry-content">${entry.content}</p>
            ${entry.tags?.length ? `<p class="entry-tags">Tags: ${entry.tags.join(', ')}</p>` : ''}
            <div class="entry-actions">
                ${isLocalStorage ?
                    `<button class="btn-copy" data-content="${this.formatContentForCopy(entry)}">Copy</button>
                     <button class="btn-delete" data-id="${entry.id}">Delete</button>` :
                    `<p class="python-label">Saved via Flask Backend</p>
                     <button class="btn-delete-flask" data-index="${entry.flaskIndex}">Delete from Server</button>`
                }
            </div>
        `;

        if (isLocalStorage) {
            entryDiv.querySelector('.btn-copy').addEventListener('click', (e) => browserAPI.copyToClipboard(e.target.getAttribute('data-content')));
            entryDiv.querySelector('.btn-delete').addEventListener('click', (e) => {
                storage.deleteEntry(parseInt(e.target.getAttribute('data-id')));
                this.loadEntries();
                browserAPI.showNotification('Entry Deleted', 'Local entry removed');
            });
        } else {
            entryDiv.querySelector('.btn-delete-flask').addEventListener('click', async (e) => {
                if (confirm('Delete from server?')) await this.deleteFlaskReflection(parseInt(e.target.getAttribute('data-index')));
            });
        }
        return entryDiv;
    }

    formatContentForCopy(entry) {
        return `${entry.title}\nDate: ${entry.date}\n\n${entry.content}`;
    }
}

document.addEventListener('DOMContentLoaded', () => new JournalApp());
