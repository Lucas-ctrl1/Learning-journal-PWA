// Storage API - Local Storage for journal entries
class StorageManager {
    constructor() {
        this.entriesKey = 'learningJournalEntries';
        this.themeKey = 'learningJournalTheme';
    }

    // Save new journal entry
    saveEntry(entry) {
        const entries = this.getEntries();
        entry.id = Date.now(); // Unique ID
        entry.date = new Date().toLocaleDateString();
        entry.timestamp = new Date().toISOString();
        entries.unshift(entry);
        localStorage.setItem(this.entriesKey, JSON.stringify(entries));
        return entry;
    }

    // Get all entries
    getEntries() {
        const entries = localStorage.getItem(this.entriesKey);
        return entries ? JSON.parse(entries) : [];
    }

    // Delete entry
    deleteEntry(id) {
        const entries = this.getEntries().filter(entry => entry.id !== id);
        localStorage.setItem(this.entriesKey, JSON.stringify(entries));
    }

    // Get entry by ID
    getEntry(id) {
        return this.getEntries().find(entry => entry.id === id);
    }
}

// Initialize storage manager
const storage = new StorageManager();