"""
将 pitfalls.json 的内容迁移为标准 Intel 格式的 Markdown 文件
序号从 140 开始
"""
import json
import os
import re

def slugify(title):
    """从标题生成 slug"""
    # 简单的 slug 生成，保留中文字符
    slug = title.lower()
    slug = re.sub(r'[^\w一-龥]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    slug = re.sub(r'--+', '-', slug)
    return slug

def generate_intel_markdown(pitfall, index):
    """生成标准 Intel 格式的 Markdown 内容"""
    slug = f"{index:03d}-pitfall-{pitfall.get('slug', slugify(pitfall['title']))}"
    
    # 确定 category 和 difficulty
    category = pitfall.get('category', 'best-practices')
    difficulty = 'intermediate'
    duration = '30分钟'
    
    # keywords = tags
    keywords = pitfall.get('tags', [])
    
    # summary = description
    summary = pitfall.get('description', pitfall['title'])
    
    # takeaways
    takeaways = [
        f"快速识别「{pitfall['title']}」的典型症状",
        f"掌握根因分析：{pitfall.get('root_cause', '')[:50]}...",
        "学会分步排查和解决问题的标准化流程",
        "了解预防措施，避免下次踩同样的坑"
    ]
    
    # 正文内容
    content = f"""---
title: {pitfall['title']}
category: {category}
keywords:
{chr(10).join([f'  - {kw}' for kw in keywords])}
difficulty: {difficulty}
duration: {duration}
summary: {summary}
takeaways:
{chr(10).join([f'  - {ta}' for ta in takeaways])}
tags:
  - 踩坑
  - 避坑指南
---

## 为什么你要学它

这是开发中非常容易踩的一个坑：**{pitfall['title']}**。

{pitfall.get('description', '')}

如果你正在遇到类似问题，或者想提前预防，这篇卡片会帮你快速定位问题、找到解决方案，并学会从根源上避免它。

## 一句话概览（快速版）

> **快速修复：{pitfall.get('quickFix', '见下文排查步骤')}**

核心要点：
- **现象**：{pitfall['symptoms'][0] if pitfall.get('symptoms') else '多种表现形式'}
- **根因**：{pitfall.get('root_cause', '需要具体分析')[:80]}
- **解决**：按照下方 {len(pitfall.get('solution', []))} 步标准流程排查

## 核心拆解

### 🔑 典型症状

{chr(10).join([f"- × {sym}" for sym in pitfall.get('symptoms', [])])}

### 🔑 根本原因

{pitfall.get('root_cause', '')}

## 完整排查方案

按照以下步骤逐一排查，通常能在几分钟内定位并解决问题：

{chr(10).join([f"{idx+1:02d}. {sol}" for idx, sol in enumerate(pitfall.get('solution', []))])}

### 快速修复（救急用）

如果你现在就卡在这里，先试试这个：

> {pitfall.get('quickFix', '按照上方步骤排查')}

## 预防措施

知道怎么解决还不够，更重要的是**下次别再踩**：

{chr(10).join([f"- {prev}" for prev in pitfall.get('prevention', [])])}

## 常见误区

1. **只看表面现象，不深挖根因** — 问题暂时解决了，但过段时间又出现
2. **跳过排查步骤直接试方案** — 容易引入新的问题
3. **不做预防措施** — 同一个坑踩好几次

## 推荐学习顺序

1. 先看「典型症状」确认你遇到的是不是这个问题
2. 再看「快速修复」试试能不能立刻解决
3. 如果不行，按照「完整排查方案」一步步来
4. 最后一定要看「预防措施」，避免下次再踩
"""
    return slug, content

def main():
    # 读取 pitfalls.json
    pitfall_path = os.path.join('content', 'pitfall', 'pitfalls.json')
    with open(pitfall_path, 'r', encoding='utf-8') as f:
        pitfalls = json.load(f)
    
    print(f"读取到 {len(pitfalls)} 条 pitfall 记录")
    
    # 生成 Markdown 文件
    start_index = 140
    intel_dir = os.path.join('content', 'intel')
    
    for i, pitfall in enumerate(pitfalls):
        index = start_index + i
        slug, content = generate_intel_markdown(pitfall, index)
        filename = f"{slug}.md"
        filepath = os.path.join(intel_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ 生成: {filename}")
    
    print(f"\n完成！共生成 {len(pitfalls)} 个文件，序号 {start_index:03d}-{start_index+len(pitfalls)-1:03d}")

if __name__ == '__main__':
    main()
