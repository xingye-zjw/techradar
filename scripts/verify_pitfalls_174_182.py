import os
import re
import sys

PITFALL_DIR = r"d:\trae_match\techradar\content\pitfall"
REQUIRED_KEYS = [
    "title", "category", "difficulty", "excerpt",
    "relatedTerms", "relatedTools", "relatedNodes",
    "prevention", "consequences", "detection"
]

FILES = [
    "174-pitfall-data-poisoning.md",
    "175-pitfall-prompt-injection-defense.md",
    "176-pitfall-tensorRT-fp16-overflow.md",
    "177-pitfall-hallucination-grounding.md",
    "178-pitfall-data-leakage.md",
    "179-pitfall-class-imbalance.md",
    "180-pitfall-i2c-lockup.md",
    "181-pitfall-battery-life.md",
    "182-pitfall-gpio-noise.md",
]

def parse_frontmatter(content):
    if not content.startswith("---"):
        return None, None
    end = content.find("---", 3)
    if end == -1:
        return None, None
    fm_text = content[3:end].strip()
    body = content[end+3:].lstrip()
    
    fm = {}
    current_key = None
    current_is_list = False
    current_list = []
    for line in fm_text.split("\n"):
        if not line.strip():
            continue
        stripped = line.rstrip()
        # list item
        list_match = re.match(r"\s*-\s*(.+)", stripped)
        if list_match and current_key and current_is_list:
            current_list.append(list_match.group(1).strip())
            continue
        # key: value
        m = re.match(r"^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)", stripped)
        if m:
            if current_key and current_is_list:
                fm[current_key] = current_list
                current_is_list = False
                current_list = []
            key, val = m.group(1), m.group(2).strip()
            if val == "" or val.startswith("["):
                current_key = key
                current_is_list = True
                current_list = []
                if val.startswith("[") and val.endswith("]"):
                    inner = val[1:-1].strip()
                    if inner:
                        current_list = [x.strip().strip('"').strip("'") for x in inner.split(",")]
                    fm[current_key] = current_list
                    current_key = None
                    current_is_list = False
            else:
                # 去掉引号
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                fm[key] = val
    if current_key and current_is_list:
        fm[current_key] = current_list
    
    return fm, body

def count_code_blocks(body):
    return len(re.findall(r"^```[a-zA-Z]*\n", body, flags=re.MULTILINE))

def count_chinese_chars(body):
    return len(re.findall(r"[\u4e00-\u9fff]", body))

def count_words(body):
    chinese = count_chinese_chars(body)
    english = len(re.findall(r"[a-zA-Z]+", body))
    return chinese + english

def main():
    all_ok = True
    results = []
    for fname in FILES:
        fpath = os.path.join(PITFALL_DIR, fname)
        result = {"file": fname, "exists": False, "keys_ok": False, "missing_keys": [], "word_count": 0, "code_blocks": 0, "related_empty": []}
        if not os.path.exists(fpath):
            results.append(result)
            all_ok = False
            continue
        result["exists"] = True
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        fm, body = parse_frontmatter(content)
        if fm is None:
            result["fm_parse_error"] = True
            all_ok = False
            results.append(result)
            continue
        
        missing = [k for k in REQUIRED_KEYS if k not in fm]
        empty_rel = []
        for k in ["relatedTerms", "relatedTools", "relatedNodes"]:
            if k in fm and (not fm[k] or len(fm[k]) == 0):
                empty_rel.append(k)
        for k in ["title", "category", "difficulty", "excerpt", "prevention", "consequences", "detection"]:
            if k in fm and (not isinstance(fm[k], str) or len(fm[k].strip()) == 0):
                empty_rel.append(k)
        
        result["missing_keys"] = missing
        result["related_empty"] = empty_rel
        result["keys_ok"] = len(missing) == 0 and len(empty_rel) == 0
        
        result["word_count"] = count_words(body)
        result["code_blocks"] = count_code_blocks(body)
        
        if not result["keys_ok"]:
            all_ok = False
        
        results.append(result)
    
    print("=" * 100)
    print(f"{'文件':<50} {'存在':<4} {'Frontmatter全齐':<14} {'字数':<8} {'代码块数':<8}")
    print("-" * 100)
    
    total_words = 0
    total_code = 0
    for r in results:
        ok_keys = "✓" if r["keys_ok"] else "✗"
        exists = "✓" if r["exists"] else "✗"
        print(f"{r['file']:<50} {exists:<4} {ok_keys:<14} {r['word_count']:<8} {r['code_blocks']:<8}")
        total_words += r["word_count"]
        total_code += r["code_blocks"]
        if r["missing_keys"]:
            print(f"    ❌ 缺失字段: {r['missing_keys']}")
        if r["related_empty"]:
            print(f"    ❌ 字段为空: {r['related_empty']}")
        if not (r["word_count"] >= 800):
            print(f"    ❌ 字数不足800: 实际 {r['word_count']}")
        if not (r["code_blocks"] >= 1):
            print(f"    ❌ 代码块不足1: 实际 {r['code_blocks']}")
    
    print("-" * 100)
    print(f"{'合计':<50} {'':<4} {'':<14} {total_words:<8} {total_code:<8}")
    print("=" * 100)
    
    if all_ok:
        print("\n✅ 所有文件校验通过！")
    else:
        print("\n❌ 存在校验失败的文件，请检查上面的错误提示")
        sys.exit(1)

if __name__ == "__main__":
    main()
