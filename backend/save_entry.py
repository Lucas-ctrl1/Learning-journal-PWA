import json
from datetime import datetime

# 1. Define the file path
DATA_FILE = 'backend/reflections.json'

# 2. Get user input
new_reflection_text = input("Please type your reflection: ")

# 3. Load existing data
try:
    with open(DATA_FILE, 'r') as file:
        reflections = json.load(file)
except FileNotFoundError:
    # This handles the case if the file doesn't exist, though you created it.
    reflections = []

# 4. Create the new entry with a date
new_entry = {
    "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "reflection": new_reflection_text,
    # Add other information here if needed
}

# 5. Append the entry
reflections.append(new_entry)

# 6. Save the updated JSON data back to the file
with open(DATA_FILE, 'w') as file:
    # Use indent=4 for human-readable formatting
    json.dump(reflections, file, indent=4)

<<<<<<< HEAD
print("Reflection saved successfully.")
=======
print("Reflection saved successfully.")
>>>>>>> 84f86000ebcdf74b93a96cb1be4ba8dbbee23371
