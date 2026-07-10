"""
S-CONTENT · audit-content3.py
=============================
T0-3 要求的 4 个 CSV 质量审计导出脚本（仅 Python 标准库，零三方依赖）

输出 4 CSV 到 scripts/reports/ 下：
  1. audit3-short-intel.csv          - Intel 正文 < 800 字
  2. audit3-nocode-intel.csv         - Intel 正文无 ``` 代码块
  3. audit3-orphan-relations.csv     - Intel 的 relatedTerms/Tools/Nodes 任一缺失或空数组
  4. audit3-pitfall-missing-prevention.csv - Pitfall(#140~#199) 缺失"预防措施"section 或 bullet<3

用法：
  python scripts/audit-content3.py
（要求从 techradar 项目根目录调用）
"""
from __future__ import annotations

import csv
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Tuple

ROOT = Path.cwd()
INTEL_DIR = ROOT / "content" / "intel"
REPORT_DIR = ROOT / "scripts" / "reports"

PITFALL_RE = re.compile(r"^(\d+)-pitfall-.*\.md$", re.IGNORECASE)
INTEL_RE = re.compile(r"^(\d+)-.+\.md$")
FM_SPLIT = re.compile(r"^---\s*$", re.MULTILINE)


# ---------- 基础：frontmatter + 正文解析（纯标准库，不依赖 PyYAML）----------
@dataclass
class ParsedMd:
    path: Path
    slug: str                 # 去掉 .md
    num: int | None           # 前缀编号，无则 None
    frontmatter: dict = field(default_factory=dict)
    body: str = ""            # 去掉 frontmatter 后的正文

    @property
    def is_pitfall(self) -> bool:
        m = PITFALL_RE.match(self.path.name)
        if m and 140 <= int(m.group(1)) <= 199:
            return True
        # 兼容命名不带 pitfall 但 category=pitfall 者
        cat = str(self.frontmatter.get("category", "")).lower()
        return "pitfall" in cat or "pitfalls" in self.path.name.lower()


def _parse_frontmatter(lines: List[str]) -> dict:
    """极简 frontmatter 解析：只支持 scalar + 内联数组（[a,b,c]）和 列表式数组（- x）。
    对本项目使用场景足够；若解析失败，字段置空而非抛异常。"""
    data: dict = {}
    cur_key: str | None = None
    cur_list: List[str] | None = None
    for raw in lines:
        line = raw.rstrip("\n")
        if not line.strip():
            continue
        # 列表项：- xxx 或   - xxx（cur_key 后紧跟）
        stripped = line.lstrip()
        if cur_key is not None and cur_list is not None and stripped.startswith("- "):
            val = stripped[2:].strip()
            # 去掉前后可选引号
            if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                val = val[1:-1]
            cur_list.append(val)
            continue
        # key: value 行
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if not key:
            continue
        cur_list = None
        # 去掉引号包裹的标量
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
            data[key] = value[1:-1]
            cur_key = key
            continue
        # 内联数组：[a, b, c]
        if value.startswith("[") and value.endswith("]"):
            inner = value[1:-1].strip()
            arr: List[str] = []
            if inner:
                for tok in inner.split(","):
                    t = tok.strip()
                    if len(t) >= 2 and t[0] == t[-1] and t[0] in ('"', "'"):
                        t = t[1:-1]
                    if t:
                        arr.append(t)
            data[key] = arr
            cur_key = key
            cur_list = arr
            continue
        # 空值（可能下一行就是 bullet 列表）
        if value == "":
            data[key] = []
            cur_key = key
            cur_list = data[key]  # type: ignore[assignment]
            continue
        # 普通标量
        data[key] = value
        cur_key = key
    return data


def parse_md(path: Path) -> ParsedMd:
    text = path.read_text(encoding="utf-8")
    m = list(FM_SPLIT.finditer(text))
    fm_lines: List[str] = []
    body = text
    num = None
    m_num = INTEL_RE.match(path.name)
    if m_num:
        num = int(m_num.group(1))
    if len(m) >= 2 and m[0].start() == 0:
        body_start = m[1].end()
        body = text[body_start:].lstrip("\n")
        fm_text = text[m[0].end():m[1].start()]
        fm_lines = fm_text.splitlines()
    fm = _parse_frontmatter(fm_lines)
    return ParsedMd(
        path=path,
        slug=path.name[:-3] if path.name.endswith(".md") else path.name,
        num=num,
        frontmatter=fm,
        body=body,
    )


def list_intels() -> List[ParsedMd]:
    res: List[ParsedMd] = []
    for p in sorted(INTEL_DIR.glob("*.md")):
        res.append(parse_md(p))
    return res


# ---------- 4 个导出函数 ----------
SH_HEAD = ["slug", "category", "difficulty", "body_chars", "threshold_800", "gap"]


def export_short_intel(rows: List[ParsedMd]) -> Tuple[str, int]:
    """正文 < 800 字的 Intel（排除 pitfall，它们字数要求不同）"""
    out = REPORT_DIR / "audit3-short-intel.csv"
    hit = 0
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(SH_HEAD)
        for r in rows:
            if r.is_pitfall:
                continue
            n = len(r.body.strip())
            if n < 800:
                w.writerow([
                    r.slug,
                    r.frontmatter.get("category", ""),
                    r.frontmatter.get("difficulty", ""),
                    n,
                    800,
                    800 - n,
                ])
                hit += 1
    return str(out), hit


NC_HEAD = ["slug", "category", "difficulty", "has_code_block", "fenced_count"]


def export_nocode_intel(rows: List[ParsedMd]) -> Tuple[str, int]:
    """Intel 正文无 ``` 代码块（排除 pitfall，pitfall 不强制）"""
    out = REPORT_DIR / "audit3-nocode-intel.csv"
    hit = 0
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(NC_HEAD)
        for r in rows:
            if r.is_pitfall:
                continue
            count = r.body.count("```") // 2  # 成对
            if count == 0:
                w.writerow([
                    r.slug,
                    r.frontmatter.get("category", ""),
                    r.frontmatter.get("difficulty", ""),
                    "false",
                    count,
                ])
                hit += 1
    return str(out), hit


OR_HEAD = [
    "slug", "category", "is_pitfall",
    "relatedTerms_count", "relatedTools_count", "relatedNodes_count",
    "missing_flags",
]


def _to_list(v) -> int:
    if v is None:
        return 0
    if isinstance(v, list):
        return len(v)
    if isinstance(v, str) and v.strip() == "":
        return 0
    # 老格式：terms1, terms2（逗号字符串）—— 兼容
    if isinstance(v, str):
        return len([x for x in v.split(",") if x.strip()])
    return 1  # 其他非空标量当成 1 个


def export_orphan_relations(rows: List[ParsedMd]) -> Tuple[str, int]:
    """relatedTerms / relatedTools / relatedNodes 任一缺失或空数组"""
    out = REPORT_DIR / "audit3-orphan-relations.csv"
    hit = 0
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(OR_HEAD)
        for r in rows:
            t = _to_list(r.frontmatter.get("relatedTerms"))
            o = _to_list(r.frontmatter.get("relatedTools"))
            n = _to_list(r.frontmatter.get("relatedNodes"))
            missing = []
            if t == 0:
                missing.append("relatedTerms")
            if o == 0:
                missing.append("relatedTools")
            if n == 0:
                missing.append("relatedNodes")
            if missing:
                w.writerow([
                    r.slug,
                    r.frontmatter.get("category", ""),
                    r.is_pitfall,
                    t, o, n,
                    "+".join(missing),
                ])
                hit += 1
    return str(out), hit


PV_HEAD = [
    "slug", "num", "category",
    "has_prevention_section",
    "prevention_bullet_count",
    "threshold_3",
    "symptom_count",
    "root_cause_len",
]

PV_RE = re.compile(r"##\s*预防措施\s*\n([\s\S]*?)(?=\n##|$)")
BULLET_RE = re.compile(r"^-\s+\S", re.MULTILINE)


def export_pitfall_prevention(rows: List[ParsedMd]) -> Tuple[str, int]:
    """Pitfall(#140~#199 号段 或 命名/分类含 pitfall)：缺预防措施 section 或 bullet<3"""
    out = REPORT_DIR / "audit3-pitfall-missing-prevention.csv"
    hit = 0
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(PV_HEAD)
        for r in rows:
            if not r.is_pitfall:
                continue
            m = PV_RE.search(r.body)
            section = bool(m)
            bullets = len(BULLET_RE.findall(m.group(1))) if m else 0
            symptom_count = r.body.count("典型症状")  # 宽松：有几个 H3 🔑 块
            if not section or bullets < 3:
                # root cause 长度估算：找"根本原因"H3 块到下一个 ### / ## 之间的文字
                rc_m = re.search(r"###\s*[^\n]*根本原因[^\n]*\n([\s\S]*?)(?=\n##|\n###|$)", r.body)
                rc_len = len(rc_m.group(1).strip()) if rc_m else 0
                w.writerow([
                    r.slug,
                    r.num if r.num is not None else "",
                    r.frontmatter.get("category", ""),
                    section,
                    bullets,
                    3,
                    symptom_count,
                    rc_len,
                ])
                hit += 1
    return str(out), hit


# ---------- CLI ----------
def main() -> int:
    if not INTEL_DIR.exists():
        print(f"[ERROR] {INTEL_DIR} 不存在，请从 techradar 项目根目录运行此脚本。", file=sys.stderr)
        return 2
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    rows = list_intels()
    print(f"[audit-content3] 共扫描到 {len(rows)} 个 intel md 文件")

    jobs = [
        ("短内容(＜800字)", export_short_intel),
        ("无代码块", export_nocode_intel),
        ("孤儿关联", export_orphan_relations),
        ("Pitfall缺预防措施", export_pitfall_prevention),
    ]
    for label, fn in jobs:
        path, n = fn(rows)
        rel = os.path.relpath(path, ROOT)
        print(f"  - {label:18s}  命中 {n:>3d} 条  → {rel}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
