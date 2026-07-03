"""
内容质量审查脚本
检查节点描述、学习任务、资源链接、关联关系等内容质量
"""
import re
import sys
sys.path.insert(0, 'scripts')
from config import DEFAULT_PATHS, read_file

def main():
    content = read_file(DEFAULT_PATHS['roadmap'])
    
    # 提取所有节点
    node_pattern = r'id:\s*"([^"]+)"(.*?)(?=id:\s*"|$)'
    nodes = re.findall(node_pattern, content, re.DOTALL)
    
    print(f"总节点数: {len(nodes)}")
    print("="*60)
    
    issues = {
        'short_desc': [],
        'empty_desc': [],
        'no_outcomes': [],
        'few_tasks': [],
        'no_resources': [],
        'few_resources': [],
        'no_related_intel': [],
        'no_related_tools': [],
        'no_related_terms': [],
        'no_related_nodes': [],
        'no_prereqs': [],
        'no_difficulty': [],
    }
    
    for node_id, node_content in nodes:
        # 检查描述
        desc_match = re.search(r'description:\s*"([^"]*)"', node_content)
        desc = desc_match.group(1) if desc_match else ""
        
        if not desc:
            issues['empty_desc'].append(node_id)
        elif len(desc) < 30:
            issues['short_desc'].append((node_id, len(desc)))
        
        # 检查学习成果
        outcomes_match = re.search(r'outcomes:\s*\[([^\]]*)\]', node_content)
        outcomes = outcomes_match.group(1) if outcomes_match else ""
        if not outcomes or outcomes.strip() == "":
            issues['no_outcomes'].append(node_id)
        
        # 检查每日任务（入门节点允许 <3 天，中级/高级要求 >=5 天）
        is_beginner = 'difficulty: "beginner"' in node_content
        task_count = len(re.findall(r'\bday:\s*\d+', node_content))
        threshold = 3 if is_beginner else 5
        if task_count < threshold:
            issues['few_tasks'].append((node_id, task_count))
        
        # 检查资源（统计所有 dailyTasks 中的 resources，包含常量引用）
        res_matches = re.findall(r'resources:\s*\[(.*?)\]', node_content, re.DOTALL)
        total_res = 0
        for res_block in res_matches:
            total_res += len(re.findall(r'title:\s*"', res_block))
            total_res += len(re.findall(r'\b[RB]_[A-Z_]+\b', res_block))
        if total_res == 0:
            issues['no_resources'].append(node_id)
        elif total_res < 3:
            issues['few_resources'].append((node_id, total_res))
        
        # 检查关联
        if 'relatedIntel:' not in node_content or 'relatedIntel: []' in node_content:
            issues['no_related_intel'].append(node_id)
        
        if 'relatedTools:' not in node_content or 'relatedTools: []' in node_content:
            issues['no_related_tools'].append(node_id)
        
        if 'relatedTerms:' not in node_content or 'relatedTerms: []' in node_content:
            issues['no_related_terms'].append(node_id)
        
        if 'relatedNodes:' not in node_content or 'relatedNodes: []' in node_content:
            issues['no_related_nodes'].append(node_id)
        
        # 检查前置依赖（入门节点允许空 prerequisites）
        prereqs_match = re.search(r'prerequisites:\s*\[([^\]]*)\]', node_content)
        if not prereqs_match or prereqs_match.group(1).strip() == "":
            if not is_beginner:
                issues['no_prereqs'].append(node_id)
        
        # 检查难度
        if 'difficulty:' not in node_content:
            issues['no_difficulty'].append(node_id)
    
    # 输出结果
    print("\n📋 内容质量检查结果:")
    print("-"*60)
    
    checks = [
        ('short_desc', '描述过短 (<30字)', len(issues['short_desc'])),
        ('empty_desc', '描述为空', len(issues['empty_desc'])),
        ('no_outcomes', '无学习成果', len(issues['no_outcomes'])),
        ('few_tasks', '学习日不足 (<5天)', len(issues['few_tasks'])),
        ('no_resources', '无学习资源', len(issues['no_resources'])),
        ('few_resources', '资源不足 (<3个)', len(issues['few_resources'])),
        ('no_related_intel', '无关联Intel', len(issues['no_related_intel'])),
        ('no_related_tools', '无关联工具', len(issues['no_related_tools'])),
        ('no_related_terms', '无关联术语', len(issues['no_related_terms'])),
        ('no_related_nodes', '无关联节点', len(issues['no_related_nodes'])),
        ('no_prereqs', '无前置依赖', len(issues['no_prereqs'])),
        ('no_difficulty', '无难度标记', len(issues['no_difficulty'])),
    ]
    
    for key, label, count in checks:
        status = "✅" if count == 0 else f"⚠️ {count}"
        print(f"  {status:10} {label}")
    
    # 详细输出有问题的节点
    print("\n📝 详细问题列表:")
    print("-"*60)
    
    if issues['short_desc']:
        print(f"\n🔸 描述过短的节点:")
        for nid, length in issues['short_desc'][:10]:
            print(f"   - {nid}: {length}字")
    
    if issues['few_tasks']:
        print(f"\n🔸 学习日不足5天的节点:")
        for nid, count in issues['few_tasks'][:10]:
            print(f"   - {nid}: {count}天")
    
    if issues['no_related_intel']:
        print(f"\n🔸 无关联Intel的节点 ({len(issues['no_related_intel'])}个):")
        for nid in issues['no_related_intel'][:10]:
            print(f"   - {nid}")
    
    if issues['no_related_tools']:
        print(f"\n🔸 无关联工具的节点 ({len(issues['no_related_tools'])}个):")
        for nid in issues['no_related_tools'][:10]:
            print(f"   - {nid}")
    
    if issues['no_related_terms']:
        print(f"\n🔸 无关联术语的节点 ({len(issues['no_related_terms'])}个):")
        for nid in issues['no_related_terms'][:10]:
            print(f"   - {nid}")
    
    # 计算质量分数
    total = len(nodes)
    score = 100
    score -= (len(issues['empty_desc']) / total) * 15
    score -= (len(issues['short_desc']) / total) * 5
    score -= (len(issues['no_outcomes']) / total) * 10
    score -= (len(issues['few_tasks']) / total) * 15
    score -= (len(issues['no_resources']) / total) * 10
    score -= (len(issues['few_resources']) / total) * 5
    score -= (len(issues['no_related_intel']) / total) * 8
    score -= (len(issues['no_related_tools']) / total) * 5
    score -= (len(issues['no_related_terms']) / total) * 5
    score -= (len(issues['no_related_nodes']) / total) * 5
    score -= (len(issues['no_difficulty']) / total) * 3
    
    print(f"\n{'='*60}")
    print(f"\n📊 综合质量分数: {max(0, round(score))}/100")
    print(f"\n总节点数: {total}")

if __name__ == '__main__':
    main()