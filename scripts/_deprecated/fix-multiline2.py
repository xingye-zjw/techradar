import re

def fix_multiline_strings(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # First pass: find all lines with unterminated string literals
    # Strategy: scan character by character, track if we're inside a string
    # If we find a newline while inside a double-quoted string, that's the problem
    
    content = ''.join(lines)
    result = []
    i = 0
    n = len(content)
    in_string = False
    string_char = None
    fixes = 0
    
    while i < n:
        c = content[i]
        
        if not in_string:
            if c == '"':
                in_string = True
                string_char = '"'
                result.append(c)
                i += 1
                continue
            elif c == "'":
                in_string = True
                string_char = "'"
                result.append(c)
                i += 1
                continue
            elif c == '`':
                # Template literal - skip ahead to closing backtick
                result.append(c)
                i += 1
                while i < n and content[i] != '`':
                    if content[i] == '\\':
                        result.append(content[i])
                        i += 1
                    result.append(content[i])
                    i += 1
                if i < n:
                    result.append(content[i])
                    i += 1
                continue
            else:
                result.append(c)
                i += 1
                continue
        else:
            # Inside a string
            if c == '\\':
                # Escaped character
                result.append(c)
                i += 1
                if i < n:
                    result.append(content[i])
                    i += 1
                continue
            elif c == string_char:
                # End of string
                in_string = False
                result.append(c)
                i += 1
                continue
            elif c == '\n':
                # Real newline inside a string - this is the problem!
                # Replace with \n (the escape sequence)
                result.append('\\n')
                fixes += 1
                i += 1
                continue
            else:
                result.append(c)
                i += 1
                continue
    
    new_content = ''.join(result)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f'Fixed {fixes} newline(s) inside string literals')
    return fixes

fix_multiline_strings('lib/roadmap-data.ts')
