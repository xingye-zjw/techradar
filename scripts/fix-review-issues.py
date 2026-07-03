"""
修复审查发现的问题：
1. 踩坑文件 category 非标准值（electronics→embedded, control→embedded）
2. 135-pitfall-interview relatedIntel 缺失
3. glossary definition markdown 标记残留
4. glossary relatedTerms 悬空引用清理
5. constants.ts 新条目格式与归段
6. 踩坑文件 summary 与正文不匹配（重新基于正文生成）
"""
import json
import re
import os

INTEL_DIR = 'content/intel'
GLOSSARY_JSON = 'content/glossary/terms.json'
CONSTANTS_PATH = 'lib/constants.ts'

# ============================================================
# Part 1: 修复踩坑文件 category 非标准值
# ============================================================
CATEGORY_MAPPING = {
    'electronics': 'embedded',  # 电子电路 → 嵌入式与硬件
    'control': 'embedded',      # 控制 → 嵌入式与硬件
    'electrical': 'embedded',   # 电气 → 嵌入式与硬件
    'signals': 'embedded',      # 通信 → 嵌入式与硬件
}

def fix_pitfall_categories():
    """修复非标准 category"""
    fixed = 0
    for filename in os.listdir(INTEL_DIR):
        if not filename.endswith('.md'):
            continue
        filepath = os.path.join(INTEL_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if not content.startswith('---'):
            continue

        # 找到 frontmatter 中的 category 行
        for old_cat, new_cat in CATEGORY_MAPPING.items():
            pattern = f'category: {old_cat}\n'
            if pattern in content:
                content = content.replace(pattern, f'category: {new_cat}\n', 1)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ {filename}: category {old_cat} → {new_cat}")
                fixed += 1
                break
    print(f"共修复 {fixed} 个文件的 category\n")


# ============================================================
# Part 2: 修复 135-pitfall-interview relatedIntel 缺失
# ============================================================
def fix_interview_related_intel():
    filepath = os.path.join(INTEL_DIR, '135-pitfall-interview.md')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'relatedIntel:' in content:
        print("ℹ️  135-pitfall-interview: 已有 relatedIntel，跳过\n")
        return

    # 在 tags 前插入 relatedIntel
    related_block = "relatedIntel:\n  - 050-cs-algo\n  - 134-pitfall-project-mgmt\ntags:"
    content = content.replace('tags:', related_block, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ 135-pitfall-interview: 已添加 relatedIntel\n")


# ============================================================
# Part 3: 修复 glossary definition markdown 标记残留
# ============================================================
def fix_glossary_definitions():
    with open(GLOSSARY_JSON, 'r', encoding='utf-8') as f:
        terms = json.load(f)

    fixed = 0
    for term in terms:
        definition = term.get('definition', '')
        # 清理 markdown 链接 [text](url) → text
        new_def = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', definition)
        # 清理斜体 *text* → text
        new_def = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'\1', new_def)
        # 清理粗体 **text** → text (再次清理)
        new_def = re.sub(r'\*\*([^*]+)\*\*', r'\1', new_def)

        if new_def != definition:
            term['definition'] = new_def
            fixed += 1
            print(f"✅ {term['slug']}: 清理 markdown 标记")

    with open(GLOSSARY_JSON, 'w', encoding='utf-8') as f:
        json.dump(terms, f, ensure_ascii=False, indent=2)

    print(f"共修复 {fixed} 个 definition\n")


# ============================================================
# Part 4: 清理 glossary relatedTerms 悬空引用
# ============================================================
def fix_glossary_related_terms():
    with open(GLOSSARY_JSON, 'r', encoding='utf-8') as f:
        terms = json.load(f)

    # 获取所有存在的 slug
    existing_slugs = {t['slug'] for t in terms}

    fixed = 0
    for term in terms:
        related = term.get('relatedTerms', [])
        original_count = len(related)
        # 过滤掉不存在的引用
        filtered = [r for r in related if r in existing_slugs]
        # 移除 category 名误用为 slug 的情况
        category_names = {'ai-ml', 'engineering', 'math', 'project', 'computer-vision',
                         'llm', 'devops', 'speech', 'machine-learning', 'data-processing',
                         'cs', 'embedded', 'electronics', 'signals', 'control', 'electrical',
                         'best-practices', 'uncategorized'}
        filtered = [r for r in filtered if r not in category_names]

        if len(filtered) != original_count:
            term['relatedTerms'] = filtered
            fixed += 1
            removed = original_count - len(filtered)
            print(f"✅ {term['slug']}: 移除 {removed} 个悬空引用（剩余 {len(filtered)} 个）")

    with open(GLOSSARY_JSON, 'w', encoding='utf-8') as f:
        json.dump(terms, f, ensure_ascii=False, indent=2)

    print(f"共修复 {fixed} 个条目的 relatedTerms\n")


# ============================================================
# Part 5: 修复 constants.ts 新条目格式与归段
# ============================================================
def fix_constants_format():
    with open(CONSTANTS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. 修复 signals-antenna 与 project-capstone 挤在同一行
    content = content.replace(
        '"project-capstone": "综合实战项目",  "signals-antenna": "天线原理与设计",',
        '"project-capstone": "综合实战项目",'
    )

    # 2. 移除末尾错误位置的 3 个新条目
    for slug in ['signals-antenna', 'electrical-relay', 'elec-fpga']:
        # 移除可能的各种格式
        patterns = [
            f'  "{slug}": "[^"]*",\n',
            f'  "{slug}": "[^"]*",',
        ]
        for p in patterns:
            content = re.sub(p, '', content)

    # 3. 将 3 个新条目插入到正确的分类段中

    # signals-antenna → Signals 段（在 signals-wireless 后）
    content = content.replace(
        '"signals-wireless": "无线通信技术",',
        '"signals-wireless": "无线通信技术",\n  "signals-antenna": "天线原理与设计",'
    )

    # electrical-relay → Electrical 段（在 electrical-safety 后）
    content = content.replace(
        '"electrical-safety": "电气安全与保护",',
        '"electrical-safety": "电气安全与保护",\n  "electrical-relay": "继电保护与电力系统自动化",'
    )

    # elec-fpga → Electronics 段（在 elec-pcb 后）
    content = content.replace(
        '"elec-pcb": "PCB 设计基础",',
        '"elec-pcb": "PCB 设计基础",\n  "elec-fpga": "FPGA 与数字系统设计",'
    )

    with open(CONSTANTS_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ constants.ts: 新条目已归入正确分类段\n")


# ============================================================
# Part 6: 修复踩坑文件 summary 与正文不匹配
# ============================================================
def fix_pitfall_summaries():
    """基于正文 ## 标题重新生成 summary"""
    fixed = 0
    for filename in os.listdir(INTEL_DIR):
        if not filename.endswith('.md') or 'pitfall' not in filename:
            continue
        filepath = os.path.join(INTEL_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if not content.startswith('---'):
            continue

        # 找到 frontmatter 结束位置
        fm_end = content.find('\n---', 4)
        if fm_end == -1:
            continue
        fm_end += 4  # 包含 \n---

        frontmatter = content[:fm_end]
        body = content[fm_end:]

        # 提取正文中的 ## 标题
        h2_titles = re.findall(r'^##\s+(.+)$', body, re.MULTILINE)
        if not h2_titles:
            continue

        # 生成新的 summary
        topics = '、'.join(h2_titles[:5])
        new_summary = f'涵盖 {len(h2_titles)} 个常见踩坑：{topics}，每个均附快速修复与排查步骤。'

        if len(new_summary) > 200:
            new_summary = new_summary[:197] + '...'

        # 替换 frontmatter 中的 summary
        old_summary_match = re.search(r'summary:\s*(.+?)(?=\n[a-z]|\ntakeaways|\nrelated|\ntags)', frontmatter, re.DOTALL)
        if old_summary_match:
            old_summary = old_summary_match.group(0)
            new_summary_line = f'summary: {new_summary}'
            new_frontmatter = frontmatter.replace(old_summary, new_summary_line, 1)

            if new_frontmatter != frontmatter:
                new_content = new_frontmatter + body
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✅ {filename}: summary 已更新（{len(h2_titles)} 个主题）")
                fixed += 1

    print(f"共修复 {fixed} 个文件的 summary\n")


if __name__ == '__main__':
    print("=" * 60)
    print("Part 1: 修复踩坑文件 category 非标准值")
    print("=" * 60)
    fix_pitfall_categories()

    print("=" * 60)
    print("Part 2: 修复 135-pitfall-interview relatedIntel")
    print("=" * 60)
    fix_interview_related_intel()

    print("=" * 60)
    print("Part 3: 修复 glossary definition markdown 标记")
    print("=" * 60)
    fix_glossary_definitions()

    print("=" * 60)
    print("Part 4: 清理 glossary relatedTerms 悬空引用")
    print("=" * 60)
    fix_glossary_related_terms()

    print("=" * 60)
    print("Part 5: 修复 constants.ts 格式与归段")
    print("=" * 60)
    fix_constants_format()

    print("=" * 60)
    print("Part 6: 修复踩坑文件 summary 与正文不匹配")
    print("=" * 60)
    fix_pitfall_summaries()

    print("\n✅ 全部修复完成")
