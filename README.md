# 📱 Learning Journal & Retro Game PWA

A beautiful, full-featured Progressive Web App for documenting your learning journey through Mobile Application Development. Built with a **Flask backend**, **HTML5 Canvas**, and modern web technologies.

![PWA](https://img.shields.io/badge/PWA-Enabled-brightgreen)
![Flask](https://img.shields.io/badge/Backend-Flask-blue)
![Snake](https://img.shields.io/badge/Game-Snake--Canvas-red)
![Responsive](https://img.shields.io/badge/Design-Responsive-success)

## ✨ Features

### 🎯 Core Functionality
- **📝 Journal Entries** - Create, read, and manage learning reflections
- **🏷️ Tagging System** - Organize entries with custom tags
- **💾 Dual Storage** - Local storage + Flask server persistence
- **🎨 Dark/Light Mode** - Toggle between themes
- **📱 Responsive Design** - Works perfectly on all devices

### 🔥 Advanced Features
- **⚡ Progressive Web App** - Installable and works offline
- **🔗 RESTful API** - Full CRUD operations with Flask
- **📊 Synchronized Dashboard** - Real-time statistics aggregating entries from server and local storage
- **🎮 Retro Snake Game** - Canvas-based mini-project with touch controls and high-score sync
- **🗑️ Selective Deletion** - Manage local vs server entries independently
- **📥 Data Export** - Download all entries as JSON
- **🎬 YouTube Integration** - Embedded programming videos
- **📋 Clipboard Support** - Copy entries with one click
- **🔔 Notifications** - User feedback and alerts

## 🚀 Live Demos

| Platform | URL | Status |
|----------|-----|---------|
| **PythonAnywhere** (Flask Backend) | [https://lucas221.pythonanywhere.com](https://lucas221.pythonanywhere.com) | ✅ **Live** |
| **GitHub Pages** (Static Version) | [https://github.com/Lucas-ctrl1/Learning-journal-PWA](https://github.com/Lucas-ctrl1/Learning-journal-PWA) | ✅ **Live** |

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup & Canvas API
- **CSS3** - Glassmorphism, Flexbox, Grid, Animations
- **JavaScript ES6+** - Modern Logic, Service Workers, Fetch API
- **PWA** - Web App Manifest, Cache API

### Backend
- **Python Flask** - REST API server
- **JSON** - Server-side data persistence
- **PythonAnywhere** - Production hosting

### APIs Integrated
- **Browser APIs**: Local Storage, Notifications, Clipboard, Geolocation
- **Third-Party APIs**: YouTube Data API

## 📁 Project Structure

```text
Learning-journal-PWA/
│
├── flask_app.py              # 🐍 Main Flask Server (Entry Point)
├── README.md                 # Project Documentation
│
├── templates/                # 📄 HTML Templates (Rendered by Flask)
│   ├── index.html            # Home Page (Live Dashboard)
│   ├── journal.html          # Journal Page (Main App Logic)
│   ├── projects.html         # Portfolio Grid
│   ├── about.html            # Profile & Skills
│   └── game.html             # 🎮 Retro Snake Game Page
│
└── static/                   # 🎨 Static Assets
    │
    ├── manifest.json         # 📱 PWA Manifest (App Metadata)
    │
    ├── css/
    │   └── style.css         # Main Stylesheet (Glassmorphism & Dark Mode)
    │
    ├── js/
    │   ├── service-worker.js # ⚙️ Service Worker (Cache & Offline Logic)
    │   ├── script.js         # Main UI Logic (Dashboard Sync, Heartbeat)
    │   ├── journal-app.js    # Journal Entry Logic (Fetch & DOM)
    │   ├── snake.js          # 🎮 Canvas Game Logic
    │   ├── storage.js        # Local Storage Helper
    │   ├── browser.js        # Browser API Utilities
    │   └── thirdparty.js     # YouTube API Integration
    │
    ├── images/
    │   ├── icon-192.jpg      # Mobile Icon
    │   └── icon-512.png      # Desktop Icon
    │
    └── backend/
        └── reflections.json  # 💾 JSON Database (Server-side storage)

```


## 🎓 Learning Journey

This project evolved through multiple labs, each adding sophisticated features:

### 📱 Lab 7 - PWA & Offline Capabilities
- **Service Worker Implementation** - Custom caching logic for full offline access and reliability
- **Web App Manifest** - Configured for installability on mobile devices with custom icons and theme colors
- **Dynamic API Caching** - "Stale-While-Revalidate" strategy for viewing journal entries without internet
- **Robust Offline Detection** - "Heartbeat" monitor with visual grayscale mode and toast notifications
- **Cache Management** - Implemented versioning strategy to force updates on client devices
  
### 🏆 Lab 6 - Flask Backend & Deployment
- **Flask REST API** with GET/POST/DELETE endpoints
- **Dual-Persistence System** - Local + Server storage
- **Selective Deletion** - Independent management of storage systems
- **PythonAnywhere deployment** - Live production hosting
- **Professional backend architecture**

### 🔧 Lab 5 - Python & JSON Integration
- **Python script** for JSON file management
- **Data export system** - Complete backup functionality
- **Reflection counter** - Live entry statistics
- **Multi-platform compatibility** - GitHub Pages + Local


# 🌐 Lab 4 - API Integration
- **Local Storage API** - Persistent client-side storage
- **Notifications API** - User feedback system
- **Clipboard API** - One-click content copying
- **YouTube Data API** - Embedded educational videos
- **Fallback mechanisms** - Robust error handling

### ⚡ Lab 3 - JavaScript & DOM
- **Dynamic navigation** - Reusable components
- **Dark mode toggle** - Theme switching
- **Live date display** - Real-time updates
- **Form validation** - User input handling

### 🎨 Lab 2 - Frontend Fundamentals
- **Mobile-first design** - Responsive layouts
- **CSS Grid & Flexbox** - Modern layouts
- **Professional styling** - Clean, accessible design

### 🚀 Lab 1 - PWA Foundations
- **Progressive Web App** - Installable, offline-capable
- **Multi-platform deployment** - GitHub Pages + PythonAnywhere
- **Temperature Converter PWA** - Additional project

## 🎯 Key Features Deep Dive

### Dual-Persistence Architecture
```javascript
// Entries saved to both systems simultaneously
await fetch("/api/reflections", {  // Flask server
    method: "POST", 
    body: JSON.stringify(entry)
});
storage.saveEntry(entry);  // Local storage
```

RESTful API Endpoints

```python
# Flask backend routes
@app.route("/api/reflections", methods=["GET"])   # Read all
@app.route("/api/reflections", methods=["POST"])  # Create new  
@app.route("/api/reflections/<int:id>", methods=["DELETE"])  # Delete
```

Smart Error Handling

```javascript
// Fallback if Flask server is unavailable
try {
    await fetch("/api/reflections");
} catch (error) {
    console.log("Server unavailable, using local data");
    return localEntries;
}
```

🚀 Quick Start

Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/Lucas-ctrl1/Learning-journal-PWA.git
   cd Learning-journal-PWA
   ```
2. Run with Flask
   ```bash
   python flask_app.py
   ```
3. Open in browser
   ```
   http://localhost:5000
   ```

Production Deployment

· PythonAnywhere: Upload to /mysite/ directory
· GitHub Pages: Automatic deployment from main branch

👨‍💻 Developer

Lucas Shrestha
Student ID: 2317991

· 🎓 BSc Computer Science Student
· 💻 Passionate about mobile development
· 🚀 Building innovative web solutions

📄 License

This project is part of academic coursework for Mobile Application Development.

