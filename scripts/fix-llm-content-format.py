import re

filepath = r'd:\trae_match\techradar\lib\roadmap-data.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

llm_nodes = ['llm-fundamentals', 'llm-pretraining', 'llm-rag', 'llm-agent', 'llm-evaluation']

def generate_task_content(title, summary):
    """Generate structured content from title and summary"""
    objective = f"今天你将学习{title}。学完后你能{summary}。"
    
    # Generate key points based on summary content
    key_points = [
        f"核心概念：理解{title}的基本原理和重要性",
        f"技术要点：掌握{summary}的关键技术",
        f"应用场景：了解{title}在实际项目中的应用方式",
        f"常见问题：认识{title}实践中可能遇到的挑战",
        f"与AI关联：理解{title}在LLM开发流程中的地位和作用"
    ]
    
    practice = f"动手实践{title}：1）阅读相关文档和教程，建立整体认知；2）动手实现或运行一个简单示例，验证理解；3）思考{title}在实际项目中的应用场景，记录你的想法；4）整理学习笔记，总结关键知识点和个人理解。"
    
    deep_dive = f"深入理解{title}的进阶话题：从原理到实践，{title}是LLM开发中的重要环节。让我们深入探索：1）技术演进：了解{title}技术的发展历程和最新进展；2）最佳实践：总结行业内{title}的成熟方法论和常见模式；3）踩坑经验：认识{title}实践中常见的陷阱和解决方案；4）与AI结合：思考{title}如何与其他AI技术协同工作，创造更大价值。持续学习和实践是掌握{title}的关键。"
    
    return objective, key_points, practice, deep_dive

def fix_node_content(node_id, content):
    """Fix content field for a specific node"""
    # Find the node
    node_start = content.find(f'id: "{node_id}"')
    if node_start == -1:
        print(f'  {node_id}: NOT FOUND')
        return content, 0
    
    # Find dailyTasks array
    daily_tasks_start = content.find('dailyTasks: [', node_start)
    if daily_tasks_start == -1:
        print(f'  {node_id}: dailyTasks not found')
        return content, 0
    
    # Find the array end
    depth = 0
    array_start = -1
    array_end = -1
    for i in range(daily_tasks_start, len(content)):
        if content[i] == '[':
            if depth == 0:
                array_start = i
            depth += 1
        elif content[i] == ']':
            depth -= 1
            if depth == 0:
                array_end = i
                break
    
    if array_start == -1 or array_end == -1:
        print(f'  {node_id}: could not find array boundaries')
        return content, 0
    
    daily_array = content[array_start:array_end+1]
    
    # Find all tasks with string content
    # Pattern: content: "..." (string, not object)
    task_pattern = r'(\{ day: (\d+), title: "([^"]+)",\s*summary: "([^"]+)",\s*)content: "([^"]+)"(,\s*duration: "[^"]+",\s*resources: \[[^\]]*\],\s*checkpoint: "[^"]+" \})'
    
    matches = list(re.finditer(task_pattern, daily_array))
    print(f'  {node_id}: found {len(matches)} tasks with string content')
    
    if len(matches) == 0:
        return content, 0
    
    # Process from end to start to preserve positions
    fixes = 0
    new_daily = daily_array
    for m in reversed(matches):
        day_num = m.group(2)
        title = m.group(3)
        summary = m.group(4)
        prefix = m.group(1)
        suffix = m.group(6)
        
        objective, key_points, practice, deep_dive = generate_task_content(title, summary)
        
        # Build key_points array string
        key_points_str = ',\n            '.join([f'"{kp}"' for kp in key_points])
        
        new_content_obj = f'''content: {{
          objective: "{objective}",
          key_points: [
            {key_points_str}
          ],
          practice: "{practice}",
          deep_dive: "{deep_dive}"
        }}'''
        
        full_new_task = prefix + new_content_obj + suffix
        new_daily = new_daily[:m.start()] + full_new_task + new_daily[m.end():]
        fixes += 1
    
    # Replace in full content
    new_content = content[:array_start] + new_daily + content[array_end+1:]
    return new_content, fixes

total_fixes = 0
for node_id in llm_nodes:
    content, fixes = fix_node_content(node_id, content)
    total_fixes += fixes
    print(f'  {node_id}: fixed {fixes} tasks')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal fixes: {total_fixes}')
print('Done.')
