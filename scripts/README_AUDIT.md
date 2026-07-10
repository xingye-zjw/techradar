# 脚本归档分类说明

本文档对 `scripts/` 目录下的所有脚本进行三状态分类，便于日常维护和归档管理。

## 分类定义

| 状态              | 说明                                                         |
| ----------------- | ------------------------------------------------------------ |
| **active**        | 日常维护仍需使用的脚本，保留在仓库中                         |
| **one-time-fill** | 历史一次性填充/修复脚本，标注可归档（未来可移入 `archive/`） |
| **audit-check**   | 审计/校验类脚本，保留用于持续质量检查                        |

---

## 分类汇总表

| 文件名                        | 分类          | 备注                              |
| ----------------------------- | ------------- | --------------------------------- |
| accurate-check.py             | audit-check   | 内容准确性审计脚本                |
| add-missing-relations.py      | active        | 补充缺失关联关系                  |
| add-missing-resource-types.py | active        | 补充缺失资源类型                  |
| add-nlp-nodes.py              | active        | 添加 NLP 路线图节点               |
| add_nlp_nodes.py              | active        | NLP 节点增补（同功能变体）        |
| add-related-nodes.py          | active        | 添加关联节点                      |
| add-suggestions.py            | active        | 添加建议内容                      |
| add-tools.py                  | active        | 添加工具箱条目                    |
| add-track-nodes.py            | active        | 添加 Track 节点                   |
| analyze-categories.py         | active        | 分类数据分析                      |
| analyze-project.py            | active        | 项目数据分析                      |
| analyze-relations.py          | active        | 关联关系分析                      |
| analyze-roadmap-size.py       | active        | 路线图规模分析                    |
| analyze-tags.py               | active        | 标签数据分析                      |
| audit-content.py              | audit-check   | 内容审计主脚本                    |
| audit-content2.py             | audit-check   | 内容审计扩展脚本                  |
| check-all-days.py             | audit-check   | 全量 Day 节点校验                 |
| check-basic-days.py           | audit-check   | 基础 Day 节点校验                 |
| check-constants.py            | audit-check   | 常量定义校验                      |
| check-days.py                 | audit-check   | Day 节点通用校验                  |
| check-intel.py                | audit-check   | Intel 内容校验                    |
| check-learning-paths.py       | audit-check   | 学习路径校验                      |
| check-partial.py              | audit-check   | 局部内容校验                      |
| check-prereqs.py              | audit-check   | 前置依赖校验                      |
| check-relations.py            | audit-check   | 关联关系校验                      |
| check-resource-types.py       | audit-check   | 资源类型校验                      |
| check-resources.py            | audit-check   | 资源引用校验                      |
| check-target-nodes.py         | audit-check   | 目标节点校验                      |
| check-task-format.py          | audit-check   | 任务格式校验                      |
| check-top-resources.py        | audit-check   | Top 资源引用校验                  |
| config.py                     | active        | 脚本共享配置模块                  |
| content-quality-check.py      | audit-check   | 内容质量综合检查                  |
| debug-suggestions.py          | active        | 建议数据调试工具                  |
| ensure-tool-github.py         | active        | 确保 Tool 关联 GitHub 链接        |
| expand-descriptions.py        | active        | 扩展描述内容                      |
| fill-basic-part1.py           | one-time-fill | 基础内容批次填充（第1部分）       |
| fill-batch1.py                | one-time-fill | 批量填充批次 1                    |
| fill-batch2.py                | one-time-fill | 批量填充批次 2                    |
| fill-batch3.py                | one-time-fill | 批量填充批次 3                    |
| fill-batch4.py                | one-time-fill | 批量填充批次 4                    |
| fill-batch5.py                | one-time-fill | 批量填充批次 5                    |
| fill-batch6.py                | one-time-fill | 批量填充批次 6                    |
| fill-batch7.py                | one-time-fill | 批量填充批次 7                    |
| fill-batch8.py                | one-time-fill | 批量填充批次 8                    |
| fill-batch9.py                | one-time-fill | 批量填充批次 9                    |
| fill-batch10.py               | one-time-fill | 批量填充批次 10                   |
| fill-batch11.py               | one-time-fill | 批量填充批次 11                   |
| fill-batch12.py               | one-time-fill | 批量填充批次 12                   |
| fill-batch13.py               | one-time-fill | 批量填充批次 13                   |
| fill-batch14.py               | one-time-fill | 批量填充批次 14                   |
| fill-cicd-days.py             | one-time-fill | CI/CD 路线图 Days 填充            |
| fill-llm-empty.py             | one-time-fill | LLM 空白内容填充                  |
| fill-llm-localrag.py          | one-time-fill | LLM LocalRAG 内容填充             |
| fill-llm-localrag2.py         | one-time-fill | LLM LocalRAG 补充填充             |
| fill-mt-days.py               | one-time-fill | 机器翻译 Days 填充                |
| fill-nlp-days.py              | one-time-fill | NLP Days 填充                     |
| fill-remaining-days.py        | one-time-fill | 剩余 Days 批量填充                |
| fill-sentiment-days.py        | one-time-fill | 情感分析 Days 填充                |
| fill-seq-labeling-days.py     | one-time-fill | 序列标注 Days 填充                |
| find-last-day.py              | active        | 查找最后一个 Day 编号工具         |
| find-track-nodes.py           | active        | 查找 Track 节点工具               |
| fix-140-162-summary.py        | one-time-fill | 一次性修复 140~162 摘要格式       |
| fix-deep-dive-colon.py        | one-time-fill | 一次性修复 deep-dive 冒号分隔问题 |
| fix-elec-pcb-duplicate.py     | one-time-fill | 一次性修复电子 PCB 重复条目       |
| fix-empty-related-terms.py    | one-time-fill | 一次性修复空关联术语              |
| fix-glossary-orphans.py       | one-time-fill | 一次性修复术语表孤立条目          |
| fix-llm-content-format.py     | one-time-fill | 一次性修复 LLM 内容格式           |
| fix-missing-days.py           | one-time-fill | 一次性修复缺失 Days               |
| fix-multiline.py              | one-time-fill | 一次性修复多行格式问题            |
| fix-multiline2.py             | one-time-fill | 一次性修复多行格式问题（补充）    |
| fix-node-level-resources.py   | one-time-fill | 一次性修复节点层级资源            |
| fix-pitfall-frontmatter.py    | one-time-fill | 一次性修复 Pitfall frontmatter    |
| fix-prereqs.py                | one-time-fill | 一次性修复前置依赖声明            |
| fix-relations.py              | one-time-fill | 一次性修复关联关系                |
| fix-resource-types.py         | one-time-fill | 一次性修复资源类型                |
| fix-resource-types2.py        | one-time-fill | 一次性修复资源类型（补充）        |
| fix-resources-and-prereqs.py  | one-time-fill | 一次性修复资源与前置依赖          |
| fix-review-issues.py          | one-time-fill | 一次性修复代码审查遗留问题        |
| full-check-days.py            | audit-check   | Days 节点全量完整检查             |
| generate-relations.py         | active        | 自动生成关联关系                  |
| generate-tool-mapping.py      | active        | 生成 Tool 映射关系                |
| list-missing-relations.py     | active        | 列出缺失的关联关系                |
| list-track-nodes.py           | active        | 列出所有 Track 节点               |
| migrate-categories.py         | active        | 分类数据迁移脚本                  |
| migrate-pitfalls-to-intel.py  | active        | Pitfall 数据迁移至 Intel          |
| normalize-tags.py             | active        | 标签数据规范化                    |
| normalize-tool-refs.py        | active        | Tool 引用规范化                   |
| prebuild-search-index.mjs     | active        | 预构建搜索索引（CI/CD 调用）      |
| temp-check-desc.py            | one-time-fill | 临时描述检查脚本（已完成使命）    |
| track-check.py                | active        | Track 节点完整性检查              |
| update-node-refs.py           | active        | 更新节点引用                      |
| verify-days.py                | audit-check   | Days 节点验证脚本                 |

---

## 分类统计

| 分类                        | 数量   | 占比     |
| --------------------------- | ------ | -------- |
| **active**（日常维护）      | 33     | 34.7%    |
| **one-time-fill**（可归档） | 43     | 45.3%    |
| **audit-check**（审计保留） | 19     | 20.0%    |
| **总计**                    | **95** | **100%** |

## 归档建议

1. `one-time-fill` 类脚本共 43 个，均为历史一次性填充/修复工作产物，
   建议下一次仓库清理时整体移入 `scripts/archive/` 子目录，不直接删除以保留溯源能力。

2. `audit-check` 类脚本共 19 个，已纳入 CI 流水线的 `content-audit` job
   （参见 `.github/workflows/ci.yml`），继续保留。

3. `active` 类脚本共 33 个，为日常维护常用工具，其中 `prebuild-search-index.mjs`
   为构建流程必需，需特别注意不要误删。
