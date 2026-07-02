import re

filepath = r'd:\trae_match\techradar\lib\roadmap-data.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix deep_dive" -> deep_dive: "
pattern = r'deep_dive"'
replacement = 'deep_dive: "'

matches = len(re.findall(pattern, content))
content = re.sub(pattern, replacement, content)

print(f'Fixed {matches} deep_dive missing colon(s)')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done.')
