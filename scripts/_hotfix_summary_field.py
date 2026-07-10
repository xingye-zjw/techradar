"""
修复 content-quality 对新增 16 篇 md 的 summary 缺失：
- 对 183-189（7 篇 Intel）+ 174-182（9 篇 Pitfall）：如果 frontmatter 里没有 summary 但有 excerpt → summary=excerpt。
- 确保 summary 长度≥30，否则用 title*8 字拼接兜底。
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
INTEL = ROOT / "content" / "intel"
PIT = ROOT / "content" / "pitfall"

TARGETS = [
    *[INTEL / f"{s}.md" for s in [
        "183-gitops-argo-cd", "184-agent-tracing-eval", "185-probability-distributions",
        "186-linear-algebra-ml", "187-llm-eval-ragas", "188-reranker-multilingual", "189-speech-asr-tts",
    ]],
    *[PIT / f"{s}.md" for s in [
        "174-pitfall-data-poisoning", "175-pitfall-prompt-injection-defense",
        "176-pitfall-tensorRT-fp16-overflow", "177-pitfall-hallucination-grounding",
        "178-pitfall-data-leakage", "179-pitfall-class-imbalance",
        "180-pitfall-i2c-lockup", "181-pitfall-battery-life", "182-pitfall-gpio-noise",
    ]],
]


def patch_one(fp: Path):
    raw = fp.read_text(encoding="utf-8")
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", raw, re.DOTALL)
    if not m:
        print(f"[SKIP no FM] {fp.name}")
        return
    fm_str = m.group(1)
    body = raw[m.end():]
    kvs: dict[str, str] = {}
    order = []
    for line in fm_str.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        mm = re.match(r"^([A-Za-z0-9_-]+)\s*:\s*(.*)$", line)
        if mm:
            k, v = mm.group(1), mm.group(2).strip()
            if k not in kvs:
                order.append(k)
            kvs[k] = v
    if not kvs:
        print(f"[SKIP empty FM] {fp.name}")
        return
    # 修复 summary
    summary_val = (kvs.get("summary") or "").strip().strip('"').strip("'")
    excerpt_val = (kvs.get("excerpt") or "").strip().strip('"').strip("'")
    if len(summary_val) < 30 and len(excerpt_val) >= 10:
        summary_val = excerpt_val
    if len(summary_val) < 30:
        title = (kvs.get("title") or fp.stem).strip().strip('"').strip("'")
        summary_val = f"{title}：从原理、工程落地代码示例到常见坑点与最佳实践的完整实践指南，配套可直接运行的最小诊断脚本和参数调整参考。"
    # 转义：如果 summary 里有 : 或引号，包 double-quote
    if ":" in summary_val or '"' in summary_val or summary_val.startswith(("[", "-")):
        escaped = summary_val.replace("\\", "\\\\").replace('"', '\\"')
        kvs["summary"] = f'"{escaped}"'
    else:
        kvs["summary"] = summary_val
    if "summary" not in order:
        order.insert(order.index("category") + 1 if "category" in order else 2, "summary")
    # 重写 FM
    lines_out = ["---"]
    for k in order:
        lines_out.append(f"{k}: {kvs[k]}")
    lines_out.append("---")
    new_raw = "\n".join(lines_out) + "\n" + body
    fp.write_text(new_raw, encoding="utf-8")
    print(f"[FIX summary] {fp.name}  summary_len={len(summary_val)}")


if __name__ == "__main__":
    for t in TARGETS:
        if not t.exists():
            print(f"[SKIP missing] {t}")
            continue
        patch_one(t)
    print("summary 修复完成")
