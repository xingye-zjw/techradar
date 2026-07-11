import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

short_nodes = [
    'git-github', 'math-probability', 'cv-cnn', 
    'nlp-sentiment-analysis', 'project-capstone',
    'project-rag-app', 'project-cv-classification',
    'project-llm-agent', 'ctrl-pid', 'llm-pretraining'
]

for node_id in short_nodes:
    pattern = rf'id:\s*"{node_id}".*?description:\s*"([^"]+)"'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        print(f'{node_id}: {match.group(1)}')
