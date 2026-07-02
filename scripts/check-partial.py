with open('lib/roadmap-data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def get_node_days(node_id):
    idx = content.find(f'id: "{node_id}"')
    if idx == -1:
        return -1
    dt_start = content.find('dailyTasks: [', idx)
    if dt_start == -1:
        return -1
    depth = 0
    i = dt_start
    while i < len(content):
        if content[i] == '[':
            depth += 1
        elif content[i] == ']':
            depth -= 1
            if depth == 0:
                dt_end = i
                break
        i += 1
    section = content[dt_start:dt_end]
    return section.count('day: ')

for node_id in ['embedded-c', 'embedded-rtos', 'embedded-driver', 'embedded-hal',
                'cs-algo', 'cs-os', 'cs-network', 'cs-database',
                'ctrl-pid', 'ctrl-ros', 'ctrl-plc', 'ctrl-servo',
                'elec-motor', 'electrical-power', 'electrical-safety',
                'elec-circuit', 'elec-signals', 'elec-digital', 'elec-pcb',
                'signals-comm', 'signals-dsp', 'signals-wireless']:
    days = get_node_days(node_id)
    print(f'{node_id}: {days} days')
