import json

# Load the JSON file
with open('public/chapters/2bse/lessons/2bse_limites_suites.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Function to remove preamble from example-box
def remove_preamble(obj):
    if isinstance(obj, dict):
        if obj.get('type') == 'example-box' and 'preamble' in obj:
            del obj['preamble']
        for key, value in obj.items():
            remove_preamble(value)
    elif isinstance(obj, list):
        for item in obj:
            remove_preamble(item)

# Apply the function
remove_preamble(data)

# Write back the JSON
with open('public/chapters/2bse/lessons/2bse_limites_suites.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)