// Browser API - Notifications
class BrowserAPIManager {
    constructor() {
        this.notificationSupported = 'Notification' in window;
    }

    async showNotification(title, message) {
        // Always show visual feedback
        this.showVisualFeedback(title, message);
        
        // Try browser notifications if supported
        if (!this.notificationSupported) return;

        try {
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }

            if (Notification.permission === 'granted') {
                const notification = new Notification(title, {
                    body: message,
                    icon: '/icon-192.png'
                });

                setTimeout(() => notification.close(), 3000);
                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            }
        } catch (error) {
            console.log('Browser notification failed, using visual feedback only');
        }
    }

    // Visual feedback that always works
    showVisualFeedback(title, message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
        `;
        
        toast.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
            <div>${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3000);
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            await this.showNotification('Copied!', 'Content copied to clipboard');
            return true;
        } catch (err) {
            console.log('Clipboard failed:', err);
            this.showNotification('Copy Failed', 'Please copy manually');
            return false;
        }
    }
}

// Initialize browser API manager
const browserAPI = new BrowserAPIManager();
