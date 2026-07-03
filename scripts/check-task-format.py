"""
检查 dailyTasks 中 content 字段的格式
旧格式：字符串或字符串数组
新格式：TaskContent 对象 { objective, key_points, practice, deep_dive }
"""
import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取所有节点
node_pattern = r'\{\s*\n\s*id:\s*"([^"]+)".*?(?=\n\s*\{\s*\n\s*id:\s*"|$)'

old_format_nodes = []
new_format_nodes = []
mixed_format_nodes = []

for match in re.finditer(node_pattern, content, re.DOTALL):
    nid = match.group(1)
    ncontent = match.group(0)
    
    # 提取 dailyTasks 部分
    dt_match = re.search(r'dailyTasks:\s*\[(.*?)\n\s*\]', ncontent, re.DOTALL)
    if not dt_match:
        continue
    
    dt_content = dt_match.group(1)
    
    # 统计 content 字段格式
    has_old = False
    has_new = False
    
    # 旧格式：content: "字符串" 或 content: ["字符串1", "字符串2"]
    old_matches = re.findall(r'content:\s*(?:"[^"]*"|\[[^\]]*\])', dt_content)
    if old_matches:
        has_old = True
    
    # 新格式：content: { objective:
    new_matches = re.findall(r'content:\s*\{', dt_content)
    if new_matches:
        has_new = True
    
    if has_old and has_new:
        mixed_format_nodes.append(nid)
    elif has_old:
        old_format_nodes.append(nid)
    elif has_new:
        new_format_nodes.append(nid)

print(f"总节点数: {len(old_format_nodes) + len(new_format_nodes) + len(mixed_format_nodes)}")
print(f"\n✅ 已使用新 TaskContent 格式: {len(new_format_nodes)} 个")
print(f"⚠️  仍使用旧格式: {len(old_format_nodes)} 个")
print(f"⚠️  混合格式: {len(mixed_format_nodes)} 个")

print(f"\n旧格式节点:")
for nid in old_format_nodes:
    print(f"  - {nid}")

print(f"\n混合格式节点:")
for nid in mixed_format_nodes:
    print(f"  - {nid}")
