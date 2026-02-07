import json
import codecs

# Read the file with latin-1 encoding (to preserve the bytes)
with open('../seed/standings-real.json', 'r', encoding='latin-1') as f:
    content = f.read()

# Parse JSON
data = json.loads(content)

# Fix tournament name in each season
for season in data:
    if 'tournament' in season:
        # The tournament name is double-encoded
        # First decode from latin-1 to get the bytes, then decode as UTF-8
        try:
            tournament_bytes = season['tournament'].encode('latin-1')
            season['tournament'] = tournament_bytes.decode('utf-8')
            print(f"Fixed tournament name for season {season['seasonName']}: {season['tournament']}")
        except:
            print(f"Could not fix tournament name for season {season['seasonName']}")

# Save with proper UTF-8 encoding
with open('../seed/standings-real.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n✅ JSON file fixed and saved with proper UTF-8 encoding")
