import re
from collections import defaultdict

def read_file():
    with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
        return f.read()

content = read_file()

# ============================================================
# 1. 提取所有节点（基于 id: 位置向前找 {，向后找 dailyTasks: [）
# ============================================================

print("=" * 80)
print("一、所有节点完整度统计")
print("=" * 80)

# 找到所有 id: "xxx" 的位置
id_positions = [(m.start(), m.group(1)) for m in re.finditer(r'id:\s*"([^"]+)"', content)]

nodes = []
for idx, (pos, node_id) in enumerate(id_positions):
    # 找到这个节点的开始 { - 往前找最近的 { （在 position 之前）
    # 更简单的方法：找这个 id 对应的 dailyTasks 数组
    # 用下一个 id 的位置作为边界
    end_pos = id_positions[idx + 1][0] if idx + 1 < len(id_positions) else len(content)
    
    node_section = content[pos:end_pos]
    
    # 提取 name
    name_m = re.search(r'name:\s*"([^"]+)"', node_section)
    name = name_m.group(1) if name_m else '?'
    
    # 提取 track
    track_m = re.search(r'track:\s*"([^"]+)"', node_section)
    track = track_m.group(1) if track_m else '?'
    
    # 提取 duration
    dur_m = re.search(r'duration:\s*"([^"]+)"', node_section)
    duration = dur_m.group(1) if dur_m else '?'
    
    # 提取 difficulty
    diff_m = re.search(r'difficulty:\s*"([^"]+)"', node_section)
    difficulty = diff_m.group(1) if diff_m else '?'
    
    # 找到 dailyTasks
    dt_start = node_section.find('dailyTasks: [')
    if dt_start == -1:
        continue
    
    # 找到 dailyTasks 数组的结束 ]
    bracket_count = 0
    dt_end = dt_start
    i = dt_start
    while i < len(node_section):
        if node_section[i] == '[':
            bracket_count += 1
        elif node_section[i] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                dt_end = i
                break
        i += 1
    
    dt_content = node_section[dt_start:dt_end]
    
    # 统计天数
    day_count = len(re.findall(r'\{\s*day:\s*\d+', dt_content))
    
    # 预期天数
    expected = 0
    if '2周' in duration:
        expected = 10
    elif '3周' in duration:
        expected = 15
    elif '4周' in duration:
        expected = 20
    
    # 统计每个 day 任务的完整性
    # 提取每个 { day: X, ... } 的内容
    # 简化：统计有多少个 objective、key_points、practice、deep_dive
    obj_count = len(re.findall(r'objective:\s*"', dt_content))
    kp_count = len(re.findall(r'key_points:\s*\[', dt_content))
    prac_count = len(re.findall(r'practice:\s*"', dt_content))
    dd_count = len(re.findall(r'deep_dive:\s*"', dt_content))
    res_count = len(re.findall(r'resources:\s*\[', dt_content))
    cp_count = len(re.findall(r'checkpoint:\s*"', dt_content))
    
    nodes.append({
        'id': node_id,
        'name': name,
        'track': track,
        'duration': duration,
        'difficulty': difficulty,
        'day_count': day_count,
        'expected': expected,
        'objective': obj_count,
        'key_points': kp_count,
        'practice': prac_count,
        'deep_dive': dd_count,
        'resources': res_count,
        'checkpoint': cp_count,
    })

# 按轨道分组
tracks = defaultdict(list)
for n in nodes:
    tracks[n['track']].append(n)

for track in sorted(tracks.keys()):
    track_nodes = sorted(tracks[track], key=lambda x: x['id'])
    total_days = sum(n['day_count'] for n in track_nodes)
    print(f"\n【{track}】({len(track_nodes)}节点, {total_days}天)")
    print(f"  {'节点ID':<28} {'名称':<15} {'难度':<10} {'天数':<8} {'完整性':<20}")
    print(f"  {'-'*90}")
    
    for n in track_nodes:
        status = '✅' if n['day_count'] == n['expected'] else '⚠️'
        # 完整性：各字段数量是否和天数匹配
        fields = ['objective', 'key_points', 'practice', 'deep_dive', 'resources', 'checkpoint']
        complete_fields = sum(1 for f in fields if n[f] == n['day_count'])
        completeness = f"{complete_fields}/{len(fields)} 字段"
        
        # 标出不完整的
        missing = [f for f in fields if n[f] != n['day_count']]
        missing_str = f" (缺: {', '.join(missing)})" if missing else ""
        
        print(f"  {status} {n['id']:<26} {n['name']:<13} {n['difficulty']:<8} {n['day_count']:>2}/{n['expected']:<4} {completeness:<14}{missing_str}")

# ============================================================
# 2. 全局统计
# ============================================================

print("\n" + "=" * 80)
print("二、全局统计")
print("=" * 80)

total_nodes = len(nodes)
total_days = sum(n['day_count'] for n in nodes)
complete_nodes = sum(1 for n in nodes if n['day_count'] == n['expected'])

print(f"\n总节点数: {total_nodes}")
print(f"总学习天数: {total_days} 天")
print(f"天数完整的节点: {complete_nodes}/{total_nodes} ({complete_nodes*100//total_nodes}%)")

# 检查哪些节点天数不足
incomplete = [n for n in nodes if n['day_count'] != n['expected']]
if incomplete:
    print(f"\n⚠️  天数不完整的节点:")
    for n in sorted(incomplete, key=lambda x: (x['track'], x['id'])):
        print(f"  - [{n['track']}] {n['id']}: {n['day_count']}/{n['expected']} 天 (差{n['expected']-n['day_count']}天)")

# ============================================================
# 3. 检查 key_points 数量分布
# ============================================================

print("\n" + "=" * 80)
print("三、Key Points 数量分布")
print("=" * 80)

# 提取每个 key_points 数组中的条目数
kp_pattern = re.compile(r'key_points:\s*\[([^\]]*)\]', re.DOTALL)
kp_counts = []

for m in kp_pattern.finditer(content):
    kp_content = m.group(1)
    # 计数：每个 "xxx" 算一条
    count = len(re.findall(r'"[^"]*"', kp_content))
    if count > 0:  # 只算有效的
        kp_counts.append(count)

kp_stats = defaultdict(int)
for c in kp_counts:
    kp_stats[c] += 1

print(f"\n总任务数: {len(kp_counts)}")
print("条数分布:")
for c in sorted(kp_stats.keys()):
    bar = '█' * min(kp_stats[c], 50)
    print(f"  {c:>2}条: {kp_stats[c]:>3}个 {bar}")

too_few = sum(1 for c in kp_counts if c < 3)
too_many = sum(1 for c in kp_counts if c > 8)
print(f"\n少于3条（偏少）: {too_few} 个")
print(f"3-8条（合理）: {len(kp_counts) - too_few - too_many} 个")
print(f"多于8条（偏多）: {too_many} 个")

# ============================================================
# 4. 资源统计
# ============================================================

print("\n" + "=" * 80)
print("四、资源质量统计")
print("=" * 80)

# 统计每个任务的资源数
res_pattern = re.compile(r'resources:\s*\[([^\]]*)\]', re.DOTALL)
res_counts = []
all_resources = []

for m in res_pattern.finditer(content):
    res_content = m.group(1)
    count = len(re.findall(r'\{\s*title:', res_content))
    res_counts.append(count)
    
    # 提取每个资源
    for res_m in re.finditer(r'\{[^}]*\}', res_content):
        res_str = res_m.group(0)
        type_m = re.search(r'type:\s*"([^"]+)"', res_str)
        source_m = re.search(r'source:\s*"([^"]+)"', res_str)
        req_m = re.search(r'required:\s*(true|false)', res_str)
        all_resources.append({
            'type': type_m.group(1) if type_m else 'none',
            'source': source_m.group(1) if source_m else 'none',
            'required': req_m.group(1) == 'true' if req_m else False,
        })

print(f"\n总资源数: {len(all_resources)}")
print(f"有资源的任务数: {sum(1 for c in res_counts if c > 0)}")
print(f"平均每任务资源数: {sum(res_counts)/len(res_counts):.1f}")

type_stats = defaultdict(int)
for r in all_resources:
    type_stats[r['type']] += 1

print(f"\n资源类型分布:")
for t, c in sorted(type_stats.items(), key=lambda x: -x[1]):
    pct = c * 100 // len(all_resources)
    print(f"  {t:<10} {c:>4}个 ({pct}%)")

source_stats = defaultdict(int)
for r in all_resources:
    source_stats[r['source']] += 1

print(f"\n资源来源分布:")
for s, c in sorted(source_stats.items(), key=lambda x: -x[1]):
    pct = c * 100 // len(all_resources)
    print(f"  {s:<10} {c:>4}个 ({pct}%)")

req_count = sum(1 for r in all_resources if r['required'])
print(f"\n必学资源: {req_count} ({req_count*100//len(all_resources)}%)")
print(f"可选资源: {len(all_resources)-req_count} ({(len(all_resources)-req_count)*100//len(all_resources)}%)")

# ============================================================
# 5. 每日任务时长统计
# ============================================================

print("\n" + "=" * 80)
print("五、每日任务时长分布")
print("=" * 80)

# 只统计 dailyTasks 内部的 duration（简化：取所有包含 "小时" 的）
dur_matches = re.findall(r'duration:\s*"([^"]*小时[^"]*)"', content)
dur_stats = defaultdict(int)
for d in dur_matches:
    dur_stats[d] += 1

print(f"\n总任务数: {len(dur_matches)}")
print("时长分布:")
for d, c in sorted(dur_stats.items(), key=lambda x: -x[1]):
    print(f"  {d:<10} {c:>3}个")

# ============================================================
# 6. 检查 practice 长度
# ============================================================

print("\n" + "=" * 80)
print("六、Practice 长度分布（质量参考）")
print("=" * 80)

practice_pattern = re.compile(r'practice:\s*"([^"]*)"', re.DOTALL)
practice_lengths = []

for m in practice_pattern.finditer(content):
    practice_text = m.group(1)
    length = len(practice_text)
    practice_lengths.append(length)

practice_lengths.sort()

print(f"\n样本数: {len(practice_lengths)}")
print(f"最短: {min(practice_lengths)} 字符")
print(f"最长: {max(practice_lengths)} 字符")
print(f"平均: {sum(practice_lengths)//len(practice_lengths)} 字符")
print(f"中位数: {practice_lengths[len(practice_lengths)//2]} 字符")

buckets = [
    ("<100字", lambda x: x < 100),
    ("100-200字", lambda x: 100 <= x < 200),
    ("200-500字", lambda x: 200 <= x < 500),
    ("500-1000字", lambda x: 500 <= x < 1000),
    (">1000字", lambda x: x >= 1000),
]

print(f"\n分布:")
for label, fn in buckets:
    count = sum(1 for l in practice_lengths if fn(l))
    pct = count * 100 // len(practice_lengths)
    bar = '█' * (pct // 2)
    print(f"  {label:<12} {count:>4}个 ({pct:>2}%) {bar}")

print("\n" + "=" * 80)
print("审查完成")
print("=" * 80)
