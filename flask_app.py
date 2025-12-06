from flask import Flask, request, jsonify, render_template
import json
import os
from datetime import datetime

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Ensure this path matches where your JSON file actually is
DATA_FILE = os.path.join(BASE_DIR, "static", "backend", "reflections.json")
app = Flask(__name__, static_folder='static', template_folder='templates')

# --- JSON HELPER FUNCTIONS ---
def load_reflections():
    """Reads reflections from reflections.json. Returns an empty list if file doesn't exist."""
    # Ensure the directory exists before trying to read
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


# --- FLASK ROUTES ---

# 1. Homepage Route
@app.route("/")
def home():
    return render_template("index.html")

# 2. Journal Route
@app.route("/journal")
def journal():
    return render_template("journal.html")

# 3. About Route
@app.route("/about")
def about():
    return render_template("about.html")

# 4. Projects Route
@app.route("/projects")
def projects():
    return render_template("projects.html")


# 5. API GET Route
@app.route("/api/reflections", methods=["GET"])
def get_reflections():
    reflections = load_reflections()
    return jsonify(reflections)

# 6. API POST Route
@app.route("/api/reflections", methods=["POST"])
def add_reflection():
    data = request.get_json()
    new_reflection = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "reflection": data.get("content", "No reflection provided")
    }
    reflections = load_reflections()
    reflections.append(new_reflection)
    save_reflections(reflections)

    return jsonify(new_reflection), 201

# 7. API DELETE Route
@app.route("/api/reflections/<int:reflection_id>", methods=["DELETE"])
def delete_reflection(reflection_id):
    reflections = load_reflections()

    if 0 <= reflection_id < len(reflections):
        deleted_reflection = reflections.pop(reflection_id)
        save_reflections(reflections)
        return jsonify({
            "message": "Reflection deleted successfully",
            "deleted": deleted_reflection
        }), 200
    else:
        return jsonify({"error": "Reflection not found"}), 404

# 8. Service Worker Route (REQUIRED for Lab 7)
# FIXED: Removed indentation so this is a top-level route
@app.route('/service-worker.js')
def service_worker():
    # This looks for the file in 'static/js/service-worker.js'
    return app.send_static_file('js/service-worker.js')

# --- STARTUP CODE (Required for local testing) ---
if __name__ == '__main__':
    # This allows you to run 'python flask_app.py' locally
    app.run(debug=True, port=5000)
