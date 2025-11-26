# 📱 Learning Journal PWA

A beautiful, full-featured Progressive Web App for documenting your learning journey through Mobile Application Development. Built with Flask backend and modern web technologies.

![PWA](https://img.shields.io/badge/PWA-Enabled-brightgreen)
![Flask](https://img.shields.io/badge/Backend-Flask-blue)
![PythonAnywhere](https://img.shields.io/badge/Deployed-PythonAnywhere-orange)
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
- **📊 Reflection Counter** - Live statistics of your entries
- **🗑️ Selective Deletion** - Manage local vs server entries independently
- **📥 Data Export** - Download all entries as JSON
- **🎬 YouTube Integration** - Embedded programming videos
- **📋 Clipboard Support** - Copy entries with one click
- **🔔 Notifications** - User feedback and alerts

## 🚀 Live Demos

| Platform | URL | Status |
|----------|-----|---------|
| **PythonAnywhere** (Flask Backend) | [https://lucas221.pythonanywhere.com](https://lucas221.pythonanywhere.com) | ✅ **Live** |
| **GitHub Pages** (Static Version) | [https://lucas-ctrl1.github.io/Learning-journal-PWA](https://lucas-ctrl1.github.io/Learning-journal-PWA) | ✅ **Live** |

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, animations
- **JavaScript ES6+** - Modern JavaScript features
- **PWA** - Service Worker, Web App Manifest

### Backend
- **Python Flask** - REST API server
- **JSON** - Data persistence
- **PythonAnywhere** - Production hosting

### APIs Integrated
- **Browser APIs**: Local Storage, Notifications, Clipboard, Geolocation
- **Third-Party APIs**: YouTube Data API

## 📁 Project Structure
```

Learning-journal-PWA/
├──templates/                 # Flask HTML templates
│├── index.html            # Homepage
│├── journal.html          # Journal entries page
│├── projects.html         # Projects showcase
│└── about.html            # About page
├──static/
│├── css/
││   └── style.css         # Main stylesheet
│├── js/
││   ├── journal-app.js    # Main application logic
││   ├── storage.js        # Local storage management
││   ├── browser.js        # Browser APIs
││   ├── thirdparty.js     # YouTube API integration
││   └── script.js         # Utility functions
│├── images/               # Assets and icons
│└── backend/
│└── reflections.json  # Server data storage
├──flask_app.py              # Flask backend server
├──manifest.json             # PWA manifest
├──service-worker.js         # Service worker for offline
└──README.md                 # This file

```

## 🎓 Learning Journey

This project evolved through multiple labs, each adding sophisticated features:

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

### 🌐 Lab 4 - API Integration
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
