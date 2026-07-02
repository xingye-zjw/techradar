import re

def fix_multiline_strings(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed_count = 0
    i = 0
    result = []
    n = len(content)
    
    while i < n:
        if content[i] == '"':
            # Found a double quote - find the end
            j = i + 1
            has_newline = False
            while j < n:
                if content[j] == '\\':
                    j += 2  # skip escaped char
                    continue
                if content[j] == '"':
                    break
                if content[j] == '\n':
                    has_newline = True
                j += 1
            
            if j < n and has_newline:
                # This is a multiline string with real newlines - fix it
                multiline = content[i+1:j]
                # Replace newlines with \n
                fixed = multiline.replace('\n', '\\n')
                result.append('"' + fixed + '"')
                fixed_count += 1
                i = j + 1
                continue
        
        result.append(content[i])
        i += 1
    
    new_content = ''.join(result)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f'Fixed {fixed_count} multiline strings')
    return fixed_count

fix_multiline_strings('lib/roadmap-data.ts')
