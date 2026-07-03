"""
批量补全节点的工具关联和学习建议
"""
import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 工具关联补充
tool_additions = {
    'cs-network': '["Wireshark", "Postman"]',
    'cs-database': '["MySQL", "PostgreSQL", "Redis"]',
    'elec-pcb': '["KiCad", "Altium Designer"]',
    'ctrl-plc': '["TIA Portal", "Codesys"]',
    'electrical-safety': '["AutoCAD Electrical"]',
}

# 前置依赖补充（入口节点没有前置是合理的，保持空）
# linux-basic, math-linear-algebra, math-probability, cs-algo, embedded-c, elec-circuit 都是入门节点
# math-tensor-ops 应该依赖 math-linear-algebra
prereq_additions = {
    'math-tensor-ops': '["math-linear-algebra"]',
}

# 学习建议补充 - 为没有 suggestions 的节点添加
suggestion_additions = {}

# 获取所有节点的 track、prerequisites 等信息
node_info = {}
for match in re.finditer(r'\{\s*\n\s*id:\s*"([^"]+)".*?(?=\n\s*\{\s*\n\s*id:\s*"|$)', content, re.DOTALL):
    nid = match.group(1)
    ncontent = match.group(0)
    
    track_match = re.search(r'track:\s*"([^"]+)"', ncontent)
    track = track_match.group(1) if track_match else ''
    
    prereq_match = re.search(r'prerequisites:\s*\[([^\]]*)\]', ncontent)
    prereqs = []
    if prereq_match and prereq_match.group(1).strip():
        prereqs = re.findall(r'"([^"]+)"', prereq_match.group(1))
    
    # 找后续节点（把当前节点作为前置的节点）
    next_nodes = []
    for m2 in re.finditer(r'\{\s*\n\s*id:\s*"([^"]+)".*?prerequisites:\s*\[([^\]]*)\]', content, re.DOTALL):
        if nid in m2.group(2):
            next_nodes.append(m2.group(1))
    
    node_info[nid] = {
        'track': track,
        'prereqs': prereqs,
        'next_nodes': next_nodes,
    }

# 为每个没有 suggestions 的节点生成建议
for nid, info in node_info.items():
    # 检查是否已有 suggestions
    pattern = rf'id:\s*"{nid}".*?suggestions:'
    if re.search(pattern, content, re.DOTALL):
        continue
    
    # 生成前置知识描述
    prereq_names = []
    for pid in info['prereqs']:
        pname_match = re.search(rf'id:\s*"{pid}".*?name:\s*"([^"]+)"', content, re.DOTALL)
        if pname_match:
            prereq_names.append(pname_match.group(1))
    
    # 生成后续学习描述
    next_names = []
    for nid2 in info['next_nodes'][:3]:
        nname_match = re.search(rf'id:\s*"{nid2}".*?name:\s*"([^"]+)"', content, re.DOTALL)
        if nname_match:
            next_names.append(nname_match.group(1))
    
    # 学习路径名称
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
    
    prereq_text = '["' + '", "'.join(prereq_names if prereq_names else ['无（入门级）']) + '"]'
    next_text = '["' + '", "'.join(next_names if next_names else ['继续深入同方向高级话题']) + '"]'
    path_text = '["' + path_names.get(info['track'], info['track'] + ' 路径') + '"]'
    
    suggestion_additions[nid] = f'''{{
      prerequisites: {prereq_text},
      nextSteps: {next_text},
      learningPath: {path_text},
    }}'''

print(f"需要补充工具关联: {len(tool_additions)} 个节点")
print(f"需要补充前置依赖: {len(prereq_additions)} 个节点")
print(f"需要补充学习建议: {len(suggestion_additions)} 个节点")

# 应用修改
modified = content

# 1. 补充工具关联
for nid, tools in tool_additions.items():
    pattern = rf'(id:\s*"{nid}".*?relatedTools:)\s*\[\]'
    match = re.search(pattern, modified, re.DOTALL)
    if match:
        modified = re.sub(pattern, rf'\1 {tools}', modified, count=1, flags=re.DOTALL)
        print(f"✅ 工具关联: {nid}")
    else:
        # 尝试找 relatedTools 行替换
        pattern2 = rf'(id:\s*"{nid}".*?relatedTools:)([^\n]+)'
        match2 = re.search(pattern2, modified, re.DOTALL)
        if match2:
            modified = re.sub(pattern2, rf'\1 {tools}', modified, count=1, flags=re.DOTALL)
            print(f"✅ 工具关联(替换): {nid}")
        else:
            print(f"❌ 工具关联未找到: {nid}")

# 2. 补充前置依赖
for nid, prereqs in prereq_additions.items():
    pattern = rf'(id:\s*"{nid}".*?prerequisites:)\s*\[\]'
    match = re.search(pattern, modified, re.DOTALL)
    if match:
        modified = re.sub(pattern, rf'\1 {prereqs}', modified, count=1, flags=re.DOTALL)
        print(f"✅ 前置依赖: {nid}")
    else:
        print(f"❌ 前置依赖未找到: {nid}")

# 3. 补充学习建议 - 在 relatedNodes 行之后插入
inserted = 0
for nid, suggestion in suggestion_additions.items():
    # 在 relatedNodes 行之后插入
    pattern = rf'(id:\s*"{nid}".*?relatedNodes:[^\n]+)'
    match = re.search(pattern, modified, re.DOTALL)
    if match:
        insert_pos = match.end()
        indent = "    "
        new_text = f'\n{indent}suggestions: {suggestion},'
        modified = modified[:insert_pos] + new_text + modified[insert_pos:]
        inserted += 1
    else:
        print(f"❌ 学习建议未找到插入点: {nid}")

print(f"\n✅ 已补充 {inserted} 个节点的学习建议")

with open('lib/roadmap-data.ts', 'w', encoding='utf-8') as f:
    f.write(modified)

print("\n所有修改已保存")
