#!/usr/bin/env python3
"""
COMPREHENSIVE FIX v2:
1. FIX ALL malformed YAML frontmatter fields in ALL content/intel/*.md files:
   - Case A: Single-line quoted with space-separated bullets:
     e.g. takeaways: "- a - b - c"
   - Case B: Multi-line quoted bullets (newline separated):
     e.g. takeaways: "- a
       - b
       - c"
   - Case C: Flow arrays with embedded bullets:
     e.g. relatedNodes: ["- llm-finetune\n  - llm-inference", "valid-node"]
   - Case D: Any other field type (keywords/tags/takeaways/relatedTerms/relatedTools/relatedNodes/relatedIntel/prevention/symptoms/consequences/detection/prerequisites)
   DOES NOT TOUCH BODY CONTENT.
2. SECOND PASS: Brute-force replace old slugs 044-rlhf→044-rlhf, 045-rag-intro→045-rag-intro, 046-agent-intro→046-agent-intro in ALL project text/JSON files.
3. UPDATE related references: also in content/glossary/terms.json, lib/roadmap-data.ts, public/search-index.json.
Robust and idempotent (safe to run multiple times).
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

AFFECTED_FIELDS = [
    "keywords",
    "tags",
    "takeaways",
    "relatedIntel",
    "relatedNodes",
    "relatedTerms",
    "relatedTools",
    "prerequisites",
    "prevention",
    "symptoms",
    "consequences",
    "detection",
    "references",
    "learningObjectives",
]

OLD_SLUG_MAP = {
    "044-rlhf": "044-rlhf",
    "045-rag-intro": "045-rag-intro",
    "046-agent-intro": "046-agent-intro",
}

# ============================================================
# Part 1: Frontmatter parsing + bullet extraction
# ============================================================

def tokenize_bullets(s: str) -> list[str] | None:
    """Tokenize a string that might be "- a - b - c" single-line OR "- a\n  - b\n  - c" multi-line.
    Returns None if not a bullet-packed string.
    """
    if not isinstance(s, str):
        return None
    t = s.strip()
    if not t.startswith("- "):
        return None
    # Split by "- " preceded by start-of-string or whitespace
    # Use regex to split on boundaries: (^|\s)- (?=[^\s])
    parts = re.split(r"(?:^|\n\s*|\r\s*)\-\s+", t)
    # parts[0] is empty (string started with - ), items follow
    items = []
    for p in parts[1:]:
        p = p.rstrip()
        if p:
            items.append(p)
    if not items:
        return None
    # Single-line case: "- a - b - c" (all on same line, no newlines)
    if "\n" not in t and len(items) == 1:
        # Maybe we actually had '- a - b - c' on one line
        inner = re.split(r"\s+-\s+", t)
        if len(inner) > 1:
            inner_items = [x.strip() for x in inner if x.strip()]
            if len(inner_items) >= 1 and inner_items[0] == t[2:].split(" - ")[0]:
                return inner_items
    return items


def yaml_escape_scalar(s: str) -> str:
    """Escape a YAML plain scalar, quote if necessary."""
    if not s:
        return "''"
    if s.startswith("'") and s.endswith("'"):
        return s  # already quoted
    if s.startswith('"') and s.endswith('"'):
        return s  # already quoted
    special = any(c in s for c in [":", "#", "[", "]", "{", "}", ",", '"', "'", "&", "*", "!", "|", ">", "%", "@", "`"])
    if special or s[0].isspace() or s[-1].isspace():
        # single-quote escape
        return "'" + s.replace("'", "''") + "'"
    return s


def process_frontmatter_block(text: str) -> tuple[str, int, dict]:
    """Parse a full markdown file text, rewrite frontmatter fields (between first and second ---).
    Returns (new_text, number_of_changes, per_field_counts)."""
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].rstrip("\r\n") != "---":
        return text, 0, {}

    # Find closing ---
    close_idx = None
    for i in range(1, len(lines)):
        if lines[i].rstrip("\r\n") == "---":
            close_idx = i
            break
    if close_idx is None:
        return text, 0, {}

    # Strategy: walk the body lines and parse STATEFUL field definitions
    # Because some fields span multiple lines (quoted multi-line), we need
    # a mini parser.
    new_fm_lines: list[str] = []  # replacement for lines[1:close_idx]
    i = 1
    changes = 0
    counts: dict[str, int] = {}
    line_term = lines[1][len(lines[1].rstrip("\r\n")):] if len(lines) > 1 else "\n"

    while i < close_idx:
        line = lines[i]
        raw = line.rstrip("\r\n")
        # Match: <indent>?fieldname: <rest>
        m_top = re.match(r"^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$", raw)
        if m_top and m_top.group(2) in AFFECTED_FIELDS:
            indent = m_top.group(1)
            field = m_top.group(2)
            rest = m_top.group(3)
            # Case 1: rest starts with [ → flow array
            if rest.startswith("["):
                # Scan to find matching close ]
                # Accumulate raw string until balanced end
                buf = rest
                start_i = i
                depth = 0
                in_s = False
                in_d = False
                finished = False
                for ch in rest:
                    if ch == "'" and not in_d:
                        in_s = not in_s
                    elif ch == '"' and not in_s:
                        in_d = not in_d
                    elif ch == "[" and not in_s and not in_d:
                        depth += 1
                    elif ch == "]" and not in_s and not in_d:
                        depth -= 1
                        if depth == 0:
                            finished = True
                            break
                while not finished and i + 1 < close_idx:
                    i += 1
                    nxt = lines[i].rstrip("\r\n")
                    buf += "\n" + nxt
                    for ch in nxt:
                        if ch == "'" and not in_d:
                            in_s = not in_s
                        elif ch == '"' and not in_s:
                            in_d = not in_d
                        elif ch == "[" and not in_s and not in_d:
                            depth += 1
                        elif ch == "]" and not in_s and not in_d:
                            depth -= 1
                            if depth == 0:
                                finished = True
                                break
                # Parse buf into items
                arr_inner = buf[buf.index("[") + 1:buf.rindex("]")]
                # Stateful comma split respecting quotes
                items: list[str] = []
                cur = ""
                in_s = False
                in_d = False
                for ch in arr_inner:
                    if ch == "'" and not in_d:
                        in_s = not in_s
                        cur += ch
                    elif ch == '"' and not in_s:
                        in_d = not in_d
                        cur += ch
                    elif ch == "," and not in_s and not in_d:
                        items.append(cur.strip())
                        cur = ""
                    else:
                        cur += ch
                if cur.strip():
                    items.append(cur.strip())
                processed: list[str] = []
                need_rewrite = False
                for raw_item in items:
                    # Strip one layer of quotes if present
                    it = raw_item
                    if len(it) >= 2:
                        if (it[0] == '"' and it[-1] == '"') or (it[0] == "'" and it[-1] == "'"):
                            inner_unquoted = it[1:-1]
                            # Check if inner itself is bullet-packed
                            sub = tokenize_bullets(inner_unquoted)
                            if sub is not None:
                                processed.extend(sub)
                                need_rewrite = True
                                continue
                            else:
                                processed.append(inner_unquoted)
                                continue
                        else:
                            # Unquoted raw string; check for bullet start directly
                            sub = tokenize_bullets(it)
                            if sub is not None:
                                processed.extend(sub)
                                need_rewrite = True
                                continue
                            processed.append(it)
                            continue
                    else:
                        sub = tokenize_bullets(it)
                        if sub is not None:
                            processed.extend(sub)
                            need_rewrite = True
                            continue
                        processed.append(it)
                if need_rewrite:
                    # Deduplicate while preserving order
                    seen: set[str] = set()
                    dedup = []
                    for x in processed:
                        if x and x not in seen:
                            seen.add(x)
                            dedup.append(x)
                    new_fm_lines.append(f"{indent}{field}:{line_term}")
                    for x in dedup:
                        esc = yaml_escape_scalar(x)
                        new_fm_lines.append(f"{indent}  - {esc}{line_term}")
                    changes += 1
                    counts[field] = counts.get(field, 0) + 1
                    i += 1
                    continue
                else:
                    # Write as block list instead of flow array (cleaner) but only if non-empty
                    if items:
                        new_fm_lines.append(f"{indent}{field}:{line_term}")
                        for x in items:
                            esc = yaml_escape_scalar(x)
                            new_fm_lines.append(f"{indent}  - {esc}{line_term}")
                        changes += 1
                        counts[field] = counts.get(field, 0) + 1
                        i += 1
                        continue
                    else:
                        new_fm_lines.append(f"{indent}{field}: []{line_term}")
                        i += 1
                        continue
            # Case 2: rest starts with " → quoted value (single-line or multi-line)
            if rest.startswith('"') or rest.startswith("'"):
                quote_char = rest[0]
                content_start = rest[1:]
                # Collect until terminating matching quote
                has_close = False
                # Check if rest closes on same line
                rest_inner = rest[1:]
                # Find unescaped close quote
                end_pos = -1
                buf = content_start
                # For multi-line, continue collecting
                while True:
                    escaped = False
                    for k, ch in enumerate(buf):
                        if escaped:
                            escaped = False
                            continue
                        if ch == "\\":
                            escaped = True
                            continue
                        if ch == quote_char:
                            end_pos = k
                            break
                    if end_pos >= 0:
                        has_close = True
                        break
                    # Add next line
                    if i + 1 < close_idx:
                        i += 1
                        buf += "\n" + lines[i].rstrip("\r\n")
                    else:
                        break
                full_value = buf[:end_pos] if end_pos >= 0 else buf
                if has_close:
                    sub = tokenize_bullets(full_value)
                    if sub is not None and len(sub) > 0:
                        new_fm_lines.append(f"{indent}{field}:{line_term}")
                        for x in sub:
                            esc = yaml_escape_scalar(x)
                            new_fm_lines.append(f"{indent}  - {esc}{line_term}")
                        changes += 1
                        counts[field] = counts.get(field, 0) + 1
                        i += 1
                        continue
                    else:
                        # Plain string value, not bullets
                        single = " ".join(full_value.split())
                        if single:
                            esc = yaml_escape_scalar(single)
                            new_fm_lines.append(f"{indent}{field}: {esc}{line_term}")
                        else:
                            new_fm_lines.append(f"{indent}{field}:{line_term}")
                        i += 1
                        continue
                else:
                    new_fm_lines.append(line)
                    i += 1
                    continue
            # Case 3: rest is empty (block-list values will follow on subsequent indented lines)
            #   → already proper YAML. Just copy.
            new_fm_lines.append(line)
            i += 1
            continue
        # Not a top-level field we care about → keep as-is
        new_fm_lines.append(line)
        i += 1

    out_lines: list[str] = []
    out_lines.append(lines[0])   # opening ---
    out_lines.extend(new_fm_lines)
    out_lines.append(lines[close_idx])  # closing ---
    out_lines.extend(lines[close_idx + 1:])
    return "".join(out_lines), changes, counts


# ============================================================
# Part 2: Old slug rename second pass
# ============================================================

def apply_old_slug_rename(text: str) -> tuple[str, int]:
    cnt = 0
    for old, new in OLD_SLUG_MAP.items():
        if old in text:
            new_text = text.replace(old, new)
            if new_text != text:
                cnt += text.count(old)
                text = new_text
    return text, cnt


def apply_old_slug_rename_json_data(o):
    """Walk JSON tree in-place and rename slugs in strings/keys."""
    changed = 0
    if isinstance(o, dict):
        keys = list(o.keys())
        for k in keys:
            if k in OLD_SLUG_MAP:
                new_k = OLD_SLUG_MAP[k]
                o[new_k] = o.pop(k)
                changed += 1
                k = new_k
            n_changes, o[k] = _walk_value(o[k])
            changed += n_changes
    elif isinstance(o, list):
        for idx in range(len(o)):
            n_changes, val = _walk_value(o[idx])
            changed += n_changes
            o[idx] = val
    elif isinstance(o, str):
        for old, new in OLD_SLUG_MAP.items():
            if old in o:
                o = o.replace(old, new)
                changed += 1
    return changed


def _walk_value(v):
    c = 0
    if isinstance(v, str):
        for old, new in OLD_SLUG_MAP.items():
            if old in v:
                v = v.replace(old, new)
                c += 1
    elif isinstance(v, list):
        for i in range(len(v)):
            nc, val = _walk_value(v[i])
            c += nc
            v[i] = val
    elif isinstance(v, dict):
        ks = list(v.keys())
        for k in ks:
            if k in OLD_SLUG_MAP:
                new_k = OLD_SLUG_MAP[k]
                v[new_k] = v.pop(k)
                k = new_k
                c += 1
            nc, val = _walk_value(v[k])
            c += nc
            v[k] = val
    return c, v


# ============================================================
# Main
# ============================================================

def main():
    # Part A: fix ALL intel markdown files
    intel_dir = ROOT / "content" / "intel"
    intel_files = sorted(intel_dir.glob("*.md"))
    total_yaml_changes = 0
    total_yaml_files = 0
    global_counts: dict[str, int] = {}
    for md in intel_files:
        text = md.read_text(encoding="utf-8")
        new_text, n_changes, counts = process_frontmatter_block(text)
        if n_changes > 0:
            md.write_text(new_text, encoding="utf-8", newline="")
            total_yaml_changes += n_changes
            total_yaml_files += 1
            for fld, c in counts.items():
                global_counts[fld] = global_counts.get(fld, 0) + c
            rel = md.relative_to(ROOT)
            print(f"[YAML FIX] {rel}: fields={list(counts.keys())} count={n_changes}")

    print(f"\nPart A YAML: modified {total_yaml_files} files, {total_yaml_changes} field rewrites.")
    print(f"  Per-field: {sorted(global_counts.items(), key=lambda x:-x[1])}")

    # Part B: rename old slugs in ALL md + TS + JSON files (text-wide brute force replacement)
    text_targets: list[Path] = []
    for glob_pattern in ["**/*.md", "**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs", "**/*.json", "**/*.py"]:
        for p in ROOT.rglob(glob_pattern):
            try:
                rp = p.resolve().relative_to(ROOT.resolve())
            except ValueError:
                continue
            # Skip node_modules and .git and .next and out directories
            parts = rp.parts
            if any(d in {"node_modules", ".git", ".next", "out", "dist", "build"} for d in parts):
                continue
            text_targets.append(p)
    # Deduplicate
    text_targets = list(dict.fromkeys(text_targets))
    slug_rename_files = 0
    slug_rename_count = 0
    for f in text_targets:
        try:
            raw_bytes = f.read_bytes()
            try:
                text = raw_bytes.decode("utf-8")
            except UnicodeDecodeError:
                continue
            new_text, cnt = apply_old_slug_rename(text)
            if cnt > 0:
                # For JSON files: additionally walk & fix keys if parseable
                if f.suffix == ".json":
                    try:
                        data = json.loads(new_text)
                        key_changes = apply_old_slug_rename_json_data(data)
                        if key_changes > 0:
                            cnt += key_changes
                            new_text = json.dumps(data, ensure_ascii=False, indent=2)
                            if not new_text.endswith("\n"):
                                new_text += "\n"
                    except Exception:
                        pass
                f.write_text(new_text, encoding="utf-8", newline="")
                slug_rename_files += 1
                slug_rename_count += cnt
                rel = f.relative_to(ROOT)
                print(f"[SLUG RENAME] {rel}: {cnt} occurrences")
        except (PermissionError, OSError, IsADirectoryError):
            continue
    print(f"\nPart B SLUG RENAME: modified {slug_rename_files} files, {slug_rename_count} total replacements.")

    print("\n=== FIX V2 COMPLETE ===")


if __name__ == "__main__":
    main()
