with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'prerequisites: ["llm-prompt", "python-basic"]',
    'prerequisites: ["llm-prompt-engineering", "pytorch-core"]'
)

content = content.replace(
    'prerequisites: ["cv-classification", "pytorch-core"]',
    'prerequisites: ["cv-cnn", "pytorch-core"]'
)

with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed prerequisites')
