"""
为 tools.json 中缺失 github 字段的工具补全默认值。
"""
import json

with open('content/toolbox/tools.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for t in data['tools']:
    if 'github' not in t or not t['github']:
        t['github'] = {
            "stars": "N/A",
            "last_release": "2025-06",
            "url": t.get('official_url', '')
        }
        print(f"已补充 github 字段: {t['name']}")

with open('content/toolbox/tools.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("tools.json  github 字段检查完成")
