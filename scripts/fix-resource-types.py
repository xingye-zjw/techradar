import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Map invalid types to valid ones
replacements = {
    'type: "tutorial"': 'type: "article"',
    'type: "wiki"': 'type: "doc"',
    'type: "website"': 'type: "doc"',
    'type: "forum"': 'type: "article"',
}

count = 0
for old, new in replacements.items():
    n = content.count(old)
    content = content.replace(old, new)
    count += n
    print(f'  Replaced {n}x: {old} -> {new}')

with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal replacements: {count}')
