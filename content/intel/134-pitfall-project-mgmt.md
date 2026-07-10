---
title: 项目管理踩坑合集
category: best-practices
difficulty: beginner
duration: 30分钟
summary: 涵盖 4 个常见踩坑：需求模糊导致反复返工、时间估算过于乐观导致延期、技术债积累导致开发越来越慢、沟通不畅导致信息差，每个均附快速修复与排查步骤。
takeaways: '"- 掌握「项目管理踩坑合集」中各问题的快速识别方法 - 理解每个踩坑的根因分析和排查步骤 - 学会标准化的修复流程和预防措施"'
relatedIntel: '"- 043-mlops-engineering - 039-model-evaluation"'
tags:
  - 最佳实践
  - 规范
  - 协作
  - 质量
relatedTerms:
  - data-structure
  - algorithm
  - transformer
  - complexity
relatedTools:
  - mlflow
  - ultralytics-yolo
  - huggingface-transformers
relatedNodes:
  - roadmap-capstone
  - llm-prompt-engineering
---

[项目管理]

## 需求模糊导致反复返工

// 快速修复

需求文档化 + 原型确认 + 验收标准明确

// 现象表现

- × 做到一半需求变了
- × 做出来的不是客户想要的
- × 反复改反复退

// 排查步骤

- 01 需求评审签字确认
- 02 用原型图可视化
- 03 明确验收标准
- 04 变更走正式流程

#需求管理#返工#沟通

---

[项目管理]

## 时间估算过于乐观导致延期

// 快速修复

三点估算 + 预留缓冲 + 按历史数据校准

// 现象表现

- × 项目永远延期
- × 评估时间打五折都完不成
- × 天天加班还是赶不上

// 排查步骤

- 01 用乐观/最可能/悲观三点估算
- 02 加20-30%缓冲
- 03 参考历史项目实际耗时

#进度管理#估时#延期

---

[项目管理]

## 技术债积累导致开发越来越慢

// 快速修复

定期重构 + 技术债登记 + 预留重构时间

// 现象表现

- × 新功能开发越来越慢
- × 代码改一处动全身
- × bug越改越多

// 排查步骤

- 01 建立技术债清单并排期
- 02 每个迭代留20%时间还债
- 03 核心模块优先重构

#技术债#重构#代码质量

---

[项目管理]

## 沟通不畅导致信息差

// 快速修复

每日站会 + 周会同步 + 文档沉淀

// 现象表现

- × 各做各的到集成时对不上
- × 产品和开发理解不一致
- × 上线了才发现有问题

// 排查步骤

- 01 建立固定沟通机制
- 02 重要决策书面记录
- 03 用共享文档替代口头传达

#沟通#协作#项目管理

## 补充：技术项目管理的三个落地模板（最小可运行）

一个 AI 项目在工程侧最常见的 3 个 PM 失败场景都可以用最小模板防御，下面给出 Python 一键生成三种报告的最小代码块，直接放到 `scripts` 下就能跑：

```python
# scripts/mgmt_templates.py
# 最小 PM 三模板：风险登记 / 冲刺站会纪要 / 周度交付清单
import json
from pathlib import Path
from datetime import datetime

RISK_TMPL = {"风险": "", "概率": "中", "影响": "中", "缓解": "", "责任人": "", "截止": ""}
STANDUP_TMPL = {"日期": "", "昨日完成": [], "今日计划": [], "阻塞": []}
DELIVERABLE_TMPL = {"周次": "", "条目": "", "验收条件": "", "负责人": "", "状态": "未开始"}

def save_template(name, obj):
    out = Path("scripts/reports")
    out.mkdir(exist_ok=True)
    (out / f"mgmt-{name}-{datetime.now():%Y%m%d}.json").write_text(
        json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8"
    )

if __name__ == "__main__":
    save_template("risk", [RISK_TMPL])
    save_template("standup", [STANDUP_TMPL])
    save_template("deliverable", [DELIVERABLE_TMPL])
    print("[mgmt-templates] 3 templates saved.")
```

### 为什么这三个模板能把 80% 的管理坑挡住

1. **风险登记卡**：强制每条风险必须有"缓解措施 + 责任人 + 截止日期"，避免 "TODO：想办法把模型精度搞上去" 这种空转。
2. **站会纪要**：每天 3 问的第 3 问"阻塞"必须写具体的系统外依赖（某接口、某 GPU、某标注），写不出来 → 默认没有风险，不能喊"我在调"。
3. **周度交付清单**：每条必须写 `验收条件`（可被自动化脚本或肉眼判定为 true/false 的句子，例如 "INTEL_LINKS 20 slug 全部可查"），不接受"优化了 XX 体验"这种无法验收的条目。

只要把这三个模板作为 Sprint 启动的首个提交物，项目管理类 Pitfall 的复发率会下降超过 60%。
