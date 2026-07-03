"""
调试：检查 suggestions 字段
"""
import re

with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 统计有 suggestions 的节点
has_suggestions = 0
no_suggestions = 0

for match in re.finditer(r'\{\s*\n\s*id:\s*"([^"]+)".*?(?=\n\s*\{\s*\n\s*id:\s*"|$)', content, re.DOTALL):
    nid = match.group(1)
    ncontent = match.group(0)
    
    if 'suggestions:' in ncontent:
        has_suggestions += 1
    else:
        no_suggestions += 1
        if no_suggestions <= 5:
            # 看看相关行
            lines = ncontent.split('\n')
            for i, line in enumerate(lines):
                if 'relatedNodes' in line:
                    print(f"{nid}: relatedNodes 行 -> {line.strip()[:80]}")
                    if i+1 < len(lines):
                        print(f"  下一行: {lines[i+1].strip()[:60]}")
                    break

print(f"\n有 suggestions: {has_suggestions}")
print(f"无 suggestions: {no_suggestions}")
