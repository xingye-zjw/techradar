"""
批量补全节点的学习建议
"""
import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 获取所有节点信息
node_info = {}
for match in re.finditer(r'\{\s*\n\s*id:\s*"([^"]+)".*?(?=\n\s*\{\s*\n\s*id:\s*"|$)', content, re.DOTALL):
    nid = match.group(1)
    ncontent = match.group(0)
    start = match.start()
    end = match.end()
    
    # 检查是否已有 suggestions
    has_suggestions = 'suggestions:' in ncontent
    
    track_match = re.search(r'track:\s*"([^"]+)"', ncontent)
    track = track_match.group(1) if track_match else ''
    
    prereq_match = re.search(r'prerequisites:\s*\[([^\]]*)\]', ncontent)
    prereqs = []
    if prereq_match and prereq_match.group(1).strip():
        prereqs = re.findall(r'"([^"]+)"', prereq_match.group(1))
    
    # 找后续节点
    next_nodes = []
    for m2 in re.finditer(r'\{\s*\n\s*id:\s*"([^"]+)".*?prerequisites:\s*\[([^\]]*)\]', content, re.DOTALL):
        if nid in m2.group(2):
            next_nodes.append(m2.group(1))
    
    node_info[nid] = {
        'track': track,
        'prereqs': prereqs,
        'next_nodes': next_nodes,
        'has_suggestions': has_suggestions,
        'start': start,
        'end': end,
    }

# 节点名称映射
node_names = {}
for nid in node_info:
    name_match = re.search(rf'id:\s*"{nid}".*?name:\s*"([^"]+)"', content, re.DOTALL)
    if name_match:
        node_names[nid] = name_match.group(1)

# 路径名称映射
path_names = {
    'cv': 'CV 路径',
    'nlp': 'NLP 路径',
    'llm': 'LLM 路径',
    'devops': 'DevOps 路径',
    'math': '数学基础路径',
    'project': '项目实战路径',
    'cs': 'CS 基础路径',
    'embedded': '嵌入式路径',
    'electronics': '电子电路路径',
    'signals': '通信信号路径',
    'control': '自动控制路径',
    'electrical': '电气工程路径',
}

# 找出需要补充 suggestions 的节点，按从后往前的顺序插入（避免位置偏移）
nodes_to_add = []
for nid, info in node_info.items():
    if not info['has_suggestions']:
        nodes_to_add.append((nid, info))

print(f"需要补充学习建议: {len(nodes_to_add)} 个节点")

# 从后往前插入，避免位置偏移
nodes_to_add.sort(key=lambda x: x[1]['start'], reverse=True)

modified = content
inserted = 0
errors = []

for nid, info in nodes_to_add:
    # 找 relatedNodes 行结束的位置
    # 先找到节点块
    node_pattern = rf'\{{\s*\n\s*id:\s*"{nid}".*?(?=\n\s*\{{\s*\n\s*id:\s*"|$)'
    node_match = re.search(node_pattern, modified, re.DOTALL)
    if not node_match:
        errors.append(f"{nid}: 找不到节点块")
        continue
    
    node_block = node_match.group(0)
    
    # 找 dailyTasks 行的位置
    dt_match = re.search(r'\n(\s*)dailyTasks:\s*\[', node_block)
    if not dt_match:
        errors.append(f"{nid}: 找不到 dailyTasks 行")
        continue
    
    indent = dt_match.group(1)
    dt_pos_in_block = dt_match.start()
    insert_pos = node_match.start() + dt_pos_in_block
    
    # 生成前置知识名称
    prereq_names = []
    for pid in info['prereqs']:
        if pid in node_names:
            prereq_names.append(node_names[pid])
    
    # 生成后续学习名称
    next_names = []
    for nid2 in info['next_nodes'][:3]:
        if nid2 in node_names:
            next_names.append(node_names[nid2])
    
    prereq_text = '["' + '", "'.join(prereq_names if prereq_names else ['无（入门级）']) + '"]'
    next_text = '["' + '", "'.join(next_names if next_names else ['继续深入同方向高级话题']) + '"]'
    path_text = '["' + path_names.get(info['track'], info['track'] + ' 路径') + '"]'
    
    suggestion_text = f'''{indent}suggestions: {{
{indent}  prerequisites: {prereq_text},
{indent}  nextSteps: {next_text},
{indent}  learningPath: {path_text},
{indent}}},
'''
    
    modified = modified[:insert_pos] + '\n' + suggestion_text + modified[insert_pos:]
    inserted += 1
    print(f"✅ {nid}")

print(f"\n成功插入: {inserted}")
print(f"失败: {len(errors)}")
for err in errors[:10]:
    print(f"  ❌ {err}")

with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(modified)

print("\n所有修改已保存")
