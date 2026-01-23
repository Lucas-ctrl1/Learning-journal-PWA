 //browser.js - Lab 7 Final Version


class BrowserAPIManager {
    constructor() {
        this.notificationSupported = 'Notification' in window;
    }


     //Shows a system notification (if granted) and always a visual toast.

    async showNotification(title, message) {
        // 1. Always provide visual feedback (Toast)
        this.showVisualFeedback(title, message);

        // 2. Try OS-level browser notifications
        if (!this.notificationSupported) return;

        try {
            // Permission is now requested globally in script.js on page load
            if (Notification.permission === 'granted') {
                const notification = new Notification(title, {
                    body: message,
                    icon: '/static/images/icon-192.jpg', // Matches your manifest.json
                    badge: '/static/images/icon-192.jpg'
                });

                setTimeout(() => notification.close(), 4000);

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            }
        } catch (error) {
            console.log('OS Notification failed, showing toast only.');
        }
    }

    //Creates a high-end visual toast for Lab 4/7 feedback.

    showVisualFeedback(title, message) {
        const toast = document.createElement('div');

        // Dynamic styling: Red for offline, Green for success
        const isOffline = !navigator.onLine;
        const bgColor = isOffline ? '#e74c3c' : '#27ae60';

        toast.style.cssText = `
            position: fixed;
            top: 25px;
            right: 25px;
            background: ${bgColor};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            z-index: 10005;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            max-width: 320px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            border-left: 5px solid rgba(255,255,255,0.3);
            animation: slideInToast 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: auto;
        `;

        toast.innerHTML = `
            <div style="font-weight: 800; font-size: 15px; margin-bottom: 4px; display: flex; align-items: center;">
                ${isOffline ? '📡 ' : '✅ '}${title}
            </div>
            <div style="opacity: 0.9;">${message}</div>
        `;

        document.body.appendChild(toast);

        // Remove logic
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            toast.style.transition = 'all 0.5s ease-in';
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    }


     //secure clipboard integration for Lab 4.

    async copyToClipboard(text) {
        if (!navigator.clipboard) {
            this.showNotification('Copy Error', 'Browser does not support clipboard API');
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copied!', 'Content saved to clipboard successfully.');
            return true;
        } catch (err) {
            console.error('Clipboard error:', err);
            this.showNotification('Copy Failed', 'Please select and copy manually.');
            return false;
        }
    }
}

// Global instance for all scripts to use
const browserAPI = new BrowserAPIManager();
