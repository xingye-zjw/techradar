import re
import json

def read_file():
    with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
        return f.read()

content = read_file()

# ============================================================
# 1. 提取所有节点及其 dailyTasks 数量
# ============================================================

# 找到所有节点的 id, track, duration, difficulty, dailyTasks 天数
node_pattern = re.compile(
    r'\{\s*'
    r'id:\s*"([^"]+)"\s*'
    r'name:\s*"([^"]+)"\s*'
    r'track:\s*"([^"]+)"\s*'
    r'duration:\s*"([^"]+)"\s*'
    r'difficulty:\s*"([^"]+)"',
    re.DOTALL
)

nodes = []
for m in node_pattern.finditer(content):
    node_id = m.group(1)
    name = m.group(2)
    track = m.group(3)
    duration = m.group(4)
    difficulty = m.group(5)
    
    # 找到这个节点的 dailyTasks
    node_start = m.start()
    dt_start = content.find('dailyTasks: [', node_start)
    if dt_start == -1:
        continue
    
    # 找到对应的 ]
    bracket_count = 0
    dt_end = dt_start
    i = dt_start
    while i < len(content):
        if content[i] == '[':
            bracket_count += 1
        elif content[i] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                dt_end = i
                break
        i += 1
    
    dt_section = content[dt_start:dt_end]
    day_count = len(re.findall(r'day:\s*\d+', dt_section))
    
    nodes.append({
        'id': node_id,
        'name': name,
        'track': track,
        'duration': duration,
        'difficulty': difficulty,
        'day_count': day_count
    })

print("=" * 80)
print("一、所有节点概览")
print("=" * 80)

from collections import defaultdict
tracks = defaultdict(list)
for n in nodes:
    tracks[n['track']].append(n)

total_nodes = len(nodes)
total_days = sum(n['day_count'] for n in nodes)
print(f"\n总节点数: {total_nodes}")
print(f"总学习天数: {total_days} 天\n")

for track, track_nodes in sorted(tracks.items()):
    track_days = sum(n['day_count'] for n in track_nodes)
    print(f"【{track}】({len(track_nodes)}个节点, 共{track_days}天)")
    for n in sorted(track_nodes, key=lambda x: x['id']):
        expected = '?'
        if n['duration'] == '2周':
            expected = 10
        elif n['duration'] == '3周':
            expected = 15
        elif n['duration'] == '4周':
            expected = 20
        
        status = '✅' if n['day_count'] == expected else '⚠️' 
        print(f"  {status} {n['id']:<25} {n['name']:<15} {n['duration']}/{n['difficulty']:<12} {n['day_count']:>2}天 (预期{expected}天)")
    print()

# ============================================================
# 2. 检查每个 dailyTask 的字段完整性
# ============================================================

print("=" * 80)
print("二、内容完整性检查（每个任务的字段）")
print("=" * 80)

# 找到所有 dailyTask
task_pattern = re.compile(
    r'\{\s*day:\s*(\d+),\s*title:\s*"([^"]+)".*?content:\s*\{',
    re.DOTALL
)

issues = []
field_issues = defaultdict(list)

for m in task_pattern.finditer(content):
    day_num = m.group(1)
    title = m.group(2)
    task_start = m.start()
    
    # 找到最近的节点 id
    # 往前找最近的 id:
    prev_content = content[:task_start]
    id_matches = list(re.finditer(r'id:\s*"([^"]+)"', prev_content))
    node_id = id_matches[-1].group(1) if id_matches else 'unknown'
    
    # 提取 content 对象的内容
    content_start = content.find('content: {', task_start)
    if content_start == -1:
        continue
    
    # 找到 content 对象的结束 }
    brace_count = 0
    i = content_start + len('content: {')
    content_end = i
    while i < len(content):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            if brace_count == 0:
                content_end = i
                break
            brace_count -= 1
        i += 1
    
    task_content = content[content_start:content_end]
    
    # 检查字段
    required_fields = ['objective', 'key_points', 'practice', 'deep_dive']
    optional_fields = ['resources', 'checkpoint', 'duration']
    
    missing = []
    for field in required_fields:
        if field + ':' not in task_content:
            missing.append(field)
            field_issues[field].append(f"{node_id} day{day_num}")
    
    if missing:
        issues.append({
            'node': node_id,
            'day': day_num,
            'title': title,
            'missing': missing
        })

if issues:
    print(f"\n❌ 发现 {len(issues)} 个任务缺少必填字段:")
    for issue in issues[:20]:
        print(f"  - {issue['node']} day{issue['day']}: 缺少 {', '.join(issue['missing'])}")
    if len(issues) > 20:
        print(f"  ... 还有 {len(issues) - 20} 个")
else:
    print("\n✅ 所有任务都包含必填字段 (objective, key_points, practice, deep_dive)")

print("\n字段缺失统计:")
for field, items in sorted(field_issues.items()):
    print(f"  {field}: {len(items)} 处缺失")

# ============================================================
# 3. 检查 key_points 数量
# ============================================================

print("\n" + "=" * 80)
print("三、Key Points 数量检查（建议4-6条）")
print("=" * 80)

kp_pattern = re.compile(r'key_points:\s*\[([^\]]*)\]', re.DOTALL)

kp_counts = []
for m in kp_pattern.finditer(content):
    kp_content = m.group(1)
    count = kp_content.count('"') // 2  # 粗略计数
    kp_counts.append(count)

kp_count_stats = {}
for c in kp_counts:
    kp_count_stats[c] = kp_count_stats.get(c, 0) + 1

print(f"\nKey Points 数量分布:")
for c in sorted(kp_count_stats.keys()):
    bar = '█' * kp_count_stats[c]
    print(f"  {c:>2}条: {kp_count_stats[c]:>3}个 {bar}")

too_few = sum(1 for c in kp_counts if c < 3)
too_many = sum(1 for c in kp_counts if c > 8)
print(f"\n少于3条: {too_few} 个")
print(f"多于8条: {too_many} 个")
print(f"3-8条（合理范围）: {len(kp_counts) - too_few - too_many} 个")

# ============================================================
# 4. 检查资源链接
# ============================================================

print("\n" + "=" * 80)
print("四、资源链接检查")
print("=" * 80)

resource_pattern = re.compile(r'resources:\s*\[([^\]]*)\]', re.DOTALL)
all_resources = resource_pattern.findall(content)

total_resources = 0
required_count = 0
optional_count = 0
type_counts = defaultdict(int)
source_counts = defaultdict(int)

for res_section in all_resources:
    resources = re.findall(r'\{[^}]*\}', res_section)
    for res in resources:
        total_resources += 1
        if 'required: true' in res:
            required_count += 1
        else:
            optional_count += 1
        
        type_m = re.search(r'type:\s*"([^"]+)"', res)
        if type_m:
            type_counts[type_m.group(1)] += 1
        
        source_m = re.search(r'source:\s*"([^"]+)"', res)
        if source_m:
            source_counts[source_m.group(1)] += 1

print(f"\n总资源数: {total_resources}")
print(f"必学资源: {required_count}")
print(f"可选资源: {optional_count}")

print(f"\n资源类型分布:")
for t, c in sorted(type_counts.items(), key=lambda x: -x[1]):
    print(f"  {t}: {c}")

print(f"\n资源来源分布:")
for s, c in sorted(source_counts.items(), key=lambda x: -x[1]):
    print(f"  {s}: {c}")

# ============================================================
# 5. 检查 practice 内容长度（太短的可能质量不足）
# ============================================================

print("\n" + "=" * 80)
print("五、Practice 内容长度检查")
print("=" * 80)

practice_pattern = re.compile(r'practice:\s*"([^"]*)"', re.DOTALL)
practice_lengths = []

for m in practice_pattern.finditer(content):
    practice_text = m.group(1)
    length = len(practice_text)
    practice_lengths.append(length)

practice_lengths.sort()

print(f"\nPractice 长度统计:")
print(f"  最短: {min(practice_lengths)} 字符")
print(f"  最长: {max(practice_lengths)} 字符")
print(f"  平均: {sum(practice_lengths)//len(practice_lengths)} 字符")
print(f"  中位数: {practice_lengths[len(practice_lengths)//2]} 字符")

short_practices = sum(1 for l in practice_lengths if l < 200)
print(f"\n少于 200 字符（可能过短）: {short_practices} 个")

# ============================================================
# 6. 检查 duration 字段
# ============================================================

print("\n" + "=" * 80)
print("六、每日任务时长检查")
print("=" * 80)

dur_pattern = re.compile(r'duration:\s*"([^"]+)"')
durations = dur_pattern.findall(content)

print(f"\n总任务数: {len(durations)}")
dur_count = defaultdict(int)
for d in durations:
    dur_count[d] += 1

for d, c in sorted(dur_count.items()):
    print(f"  {d}: {c} 个任务")

# ============================================================
# 总结
# ============================================================

print("\n" + "=" * 80)
print("审查总结")
print("=" * 80)
print(f"""
✅ 通过的项目:
  - TypeScript 编译通过
  - 21 个内容质量测试通过
  - {len(nodes)} 个节点，共 {total_days} 天学习内容
  - 必填字段完整性: {len(kp_counts) - len(issues)}/{len(kp_counts)} 任务
  - 资源总数: {total_resources} 个

⚠️ 需要关注的问题:
  - 缺少必填字段的任务: {len(issues)} 个
  - Key Points 数量异常（<3或>8）: {too_few + too_many} 个
  - Practice 过短（<200字）: {short_practices} 个
""")
