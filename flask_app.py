from flask import Flask, request, jsonify, render_template
import json
import os
from datetime import datetime

# --- CONFIGURATION (Remains Unchanged) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "static", "backend", "reflections.json")
app = Flask(__name__, static_folder='static', template_folder='templates')

# --- JSON HELPER FUNCTIONS (Remains Unchanged) ---
# ... (load_reflections and save_reflections functions go here) ...
def load_reflections():
    """Reads reflections from reflections.json. Returns an empty list if file doesn't exist."""
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                file_content = f.read()
                return json.loads(file_content) if file_content else []
        except json.JSONDecodeError:
            return []
    return []

def save_reflections(reflections):
    """Saves reflections back into reflections.json."""
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(reflections, f, indent=4)


# --- FLASK ROUTES (NEW AND CORRECTED) ---

# 1. Homepage Route: Serves the index.html file
@app.route("/")
def home():
    """Serves the main index.html file."""
    return render_template("index.html")

# 2. Journal Route: Serves the journal.html file
@app.route("/journal")
def journal():
    """Serves the journal.html file."""
    return render_template("journal.html")

# 3. About Route: Serves the about.html file
@app.route("/about")
def about():
    """Serves the about.html file."""
    return render_template("about.html")

# 4. Projects Route: Serves the projects.html file
@app.route("/projects")
def projects():
    """Serves the projects.html file."""
    return render_template("projects.html")


# 5. API GET Route: Returns all reflections as JSON
@app.route("/api/reflections", methods=["GET"])
def get_reflections():
    """Loads reflections from JSON file and returns them to the frontend PWA."""
    reflections = load_reflections()
    return jsonify(reflections)

# 6. API POST Route: Receives new reflections and saves them
@app.route("/api/reflections", methods=["POST"])
def add_reflection():
    """Receives JSON data from the PWA, appends it, and saves."""
    data = request.get_json()
    new_reflection = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "reflection": data.get("content", "No reflection provided")
    }
    reflections = load_reflections()
    reflections.append(new_reflection)
    save_reflections(reflections)

    return jsonify(new_reflection), 201
