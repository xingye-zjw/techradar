#!/usr/bin/env python3
"""Hotfix 12 bad YAML frontmatters: `relatedIntel: - slug` → `relatedIntel: ["slug"]` (flow-sequence syntax).
These were produced by audit3-patch.py's hand-written parser that read YAML block-sequence single-items as literal "- slug" strings."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
PATTERN = re.compile(r"^(relatedIntel)\s*:\s*-\s*(\S.*)$")

total_fixed = 0
for md in list(CONTENT.glob("**/*.md")):
    raw = md.read_text(encoding="utf-8")
    lines = raw.splitlines(keepends=True)
    # Only rewrite within the FIRST frontmatter block (between --- and ---)
    if not lines or lines[0].strip() != "---":
        continue
    i = 1
    changed = False
    while i < len(lines):
        line = lines[i]
        stripped = line.rstrip("\r\n")
        if stripped == "---":
            break
        m = PATTERN.match(stripped)
        if m:
            key, val = m.group(1), m.group(2).strip().strip('"').strip("'")
            # Preserve line ending
            end = line[len(stripped):]
            lines[i] = f'{key}: ["{val}"]{end}'
            changed = True
            total_fixed += 1
            print(f"[FIX] {md.relative_to(ROOT)} L{i+1}: {stripped!r}")
        i += 1
    if changed:
        md.write_text("".join(lines), encoding="utf-8")

print(f"\nTotal YAML fixes: {total_fixed}")
