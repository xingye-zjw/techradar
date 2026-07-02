import re

filepath = r'd:\trae_match\techradar\lib\roadmap-data.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

content = ''.join(lines)

# Find elec-pcb node
node_start = content.find('id: "elec-pcb"')
if node_start == -1:
    print('ERROR: elec-pcb node not found')
    exit(1)

# Find dailyTasks array start
daily_tasks_start = content.find('dailyTasks: [', node_start)
if daily_tasks_start == -1:
    print('ERROR: dailyTasks not found')
    exit(1)

# Find the array end by tracking brackets
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
    print('ERROR: could not find dailyTasks array boundaries')
    exit(1)

daily_tasks_content = content[array_start:array_end+1]
print(f'dailyTasks array length: {len(daily_tasks_content)} chars')

# Count days by finding "day: N" pattern
day_pattern = r'\{ day: (\d+),'
days = re.findall(day_pattern, daily_tasks_content)
print(f'Days found: {days}')
print(f'Total days: {len(days)}')

# Find duplicate day 8 positions
day8_positions = [m.start() for m in re.finditer(r'\{ day: 8,', daily_tasks_content)]
print(f'Day 8 found at positions: {day8_positions}')

if len(day8_positions) >= 2:
    # Find the second day 8 and remove from there to the end (but keep the closing ])
    # Actually, we need to find where the duplicate days end
    # Let's find the second day 8 and remove from there to before the closing ]
    
    second_day8_pos = day8_positions[1]
    
    # Find the last complete day object before the array end
    # We need to find where the duplicate block ends
    # The duplicate is day 8, 9, 10 (the second occurrence)
    
    # Let's look for the pattern: second day 8 -> ... -> last checkpoint before array end
    # Find the last "checkpoint:" before array end
    last_checkpoint = daily_tasks_content.rfind('checkpoint:')
    print(f'Last checkpoint at: {last_checkpoint}')
    
    # Find the closing } of that last task
    close_brace_pos = daily_tasks_content.find(' }', last_checkpoint)
    if close_brace_pos == -1:
        close_brace_pos = daily_tasks_content.find('}', last_checkpoint)
    print(f'Close brace after last checkpoint: {close_brace_pos}')
    
    # The duplicate section is from second_day8_pos to close_brace_pos + 1
    # But we also need to remove the comma before the second day 8
    
    # Find the comma before the second day 8
    comma_pos = daily_tasks_content.rfind(',', 0, second_day8_pos)
    print(f'Comma before second day 8: {comma_pos}')
    
    # Remove from comma_pos + 1 to close_brace_pos + 1
    # Actually let's be more careful - remove the second set of day 8-10
    
    # Find the first day 10 (original) and second day 10 (duplicate)
    day10_positions = [m.start() for m in re.finditer(r'\{ day: 10,', daily_tasks_content)]
    print(f'Day 10 positions: {day10_positions}')
    
    if len(day10_positions) >= 2:
        # Find end of second day 10
        second_day10_start = day10_positions[1]
        # Find the closing brace and checkpoint
        checkpoint_after_day10 = daily_tasks_content.find('checkpoint:', second_day10_start)
        print(f'Checkpoint after second day 10: {checkpoint_after_day10}')
        
        # Find end of this task object
        # Look for ' },' or ' }\n' or ' }]' pattern
        end_pos = -1
        for i in range(checkpoint_after_day10, min(checkpoint_after_day10 + 500, len(daily_tasks_content))):
            if daily_tasks_content[i] == '}' and i > checkpoint_after_day10 + 10:
                # Check if this is the closing brace of the task
                # Look ahead to see if there's a comma or array close
                rest = daily_tasks_content[i:i+5]
                if rest.startswith('},') or rest.startswith('}\n') or rest.startswith(' }'):
                    end_pos = i + 1
                    break
        
        print(f'End of second day 10 task: {end_pos}')
        
        if end_pos != -1:
            # Find the comma before the second day 8
            start_remove = comma_pos  # remove from the comma
            end_remove = end_pos
            
            print(f'\nWill remove from position {start_remove} to {end_remove}')
            print(f'Content to remove (first 100 chars): {repr(daily_tasks_content[start_remove:start_remove+100])}')
            print(f'...')
            print(f'Content to remove (last 100 chars): {repr(daily_tasks_content[end_remove-100:end_remove])}')
            
            # Remove the duplicate section
            new_daily_tasks = daily_tasks_content[:start_remove] + daily_tasks_content[end_remove:]
            
            # Count days in new content
            new_days = re.findall(day_pattern, new_daily_tasks)
            print(f'\nNew day count: {len(new_days)}')
            print(f'New days: {new_days}')
            
            # Replace in the full content
            new_content = content[:array_start] + new_daily_tasks + content[array_end+1:]
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print('\nSuccessfully removed duplicate days!')
        else:
            print('ERROR: could not find end of second day 10')
    else:
        print('ERROR: expected at least 2 day 10 entries')
else:
    print('No duplicate day 8 found')
