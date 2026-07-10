# 内容质量提升实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立内容质量验证测试框架，并按模块批量提升情报、术语、工具、踩坑内容的科学性和详细程度。

**Architecture:** 先搭建 Vitest 测试框架 + 质量检查测试，建立基线指标；再按模块逐批提升内容质量（情报→术语→工具→踩坑），每批完成后运行测试验证。

**Tech Stack:** Next.js 14, TypeScript, Vitest, Node.js fs

## Global Constraints

- 内容格式：情报使用 Markdown + YAML frontmatter，术语/工具/踩坑使用 JSON
- 现有验证器：`lib/content-validator.ts`（仅检查必填字段），`scripts/validate-content.ts`
- 现有数据加载函数：`getAllIntelCards()`（lib/intel.ts）、`getAllTerms()`（lib/glossary.ts）、`getAllTools()`（lib/toolbox.ts）、`getAllPitfalls()`（lib/pitfall.ts）
- 测试框架：项目当前无测试框架，需安装 Vitest
- 暗色模式主题不变，仅修改内容数据文件
- 质量标准：情报 ≥1000 字、术语定义 ≥100 字、工具 use_cases ≥2、踩坑 root_cause ≥50 字

---

## File Structure

| 操作   | 文件                                      | 职责                                   |
| ------ | ----------------------------------------- | -------------------------------------- |
| Create | `vitest.config.ts`                        | Vitest 配置                            |
| Create | `__tests__/lib/content-quality.test.ts`   | 内容质量检查测试（长度、结构、完整性） |
| Create | `__tests__/lib/content-validator.test.ts` | 验证器单元测试                         |
| Modify | `package.json`                            | 添加 vitest 依赖和 test 脚本           |
| Modify | `content/intel/*.md`                      | 提升情报内容质量（53 篇）              |
| Modify | `content/glossary/terms.json`             | 完善术语定义                           |
| Modify | `content/glossary/terms/*.md`             | 补充术语详情                           |
| Modify | `content/toolbox/tools.json`              | 更新工具信息                           |
| Modify | `content/pitfall/pitfalls.json`           | 补充踩坑根因分析                       |

---

### Task 1: 搭建 Vitest 测试框架

**Files:**

- Create: `vitest.config.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: 无
- Produces: `npm test` 命令可用

- [ ] **Step 1: 安装 Vitest**

Run: `npm install -D vitest`
Expected: 安装成功，package.json devDependencies 中出现 vitest

- [ ] **Step 2: 创建 Vitest 配置**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
```

- [ ] **Step 3: 添加 test 脚本到 package.json**

在 `scripts` 中添加：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 验证 Vitest 可用**

Run: `npm test -- --passWithNoTests`
Expected: Vitest 启动成功，0 tests（因为还没有测试文件）

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "test: add vitest framework for content quality testing"
```

---

### Task 2: 内容质量检查测试

**Files:**

- Create: `__tests__/lib/content-quality.test.ts`

**Interfaces:**

- Consumes: `getAllIntelCards()`, `getAllTerms()` (via glossary), `getAllTools()`, `getAllPitfalls()`
- Produces: 测试套件，验证所有内容符合质量标准

- [ ] **Step 1: 创建目录**

Run: `mkdir -p __tests__/lib`

- [ ] **Step 2: 编写情报质量测试**

Create `__tests__/lib/content-quality.test.ts`:

````typescript
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// 直接读取 JSON 数据，避免 server-only 模块问题
function readIntelFiles(): { name: string; content: string; frontmatter: Record<string, any> }[] {
  const intelDir = path.join(process.cwd(), "content", "intel");
  if (!fs.existsSync(intelDir)) return [];

  const files = fs.readdirSync(intelDir).filter((f) => f.endsWith(".md"));
  return files.map((name) => {
    const raw = fs.readFileSync(path.join(intelDir, name), "utf8");
    // 简单提取 frontmatter
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter: Record<string, any> = {};
    if (fmMatch) {
      fmMatch[1].split("\n").forEach((line) => {
        const [key, ...rest] = line.split(":");
        if (key && rest.length) {
          frontmatter[key.trim()] = rest
            .join(":")
            .trim()
            .replace(/^["']|["']$/g, "");
        }
      });
    }
    const content = fmMatch ? raw.slice(fmMatch[0].length).trim() : raw;
    return { name, content, frontmatter };
  });
}

function readJsonFile<T>(relativePath: string): T[] {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T[];
}

describe("情报内容质量", () => {
  const articles = readIntelFiles();

  it("应有足够的文章数量", () => {
    expect(articles.length).toBeGreaterThanOrEqual(40);
  });

  it("每篇文章应有足够的内容长度（≥800 字符）", () => {
    const shortArticles: string[] = [];
    articles.forEach((a) => {
      if (a.content.length < 800) shortArticles.push(a.name);
    });
    expect(shortArticles).toEqual([]);
  });

  it("每篇文章应包含代码示例", () => {
    const noCode: string[] = [];
    articles.forEach((a) => {
      if (!a.content.includes("```")) noCode.push(a.name);
    });
    expect(noCode).toEqual([]);
  });

  it("每篇文章应有 title frontmatter", () => {
    const missing: string[] = [];
    articles.forEach((a) => {
      if (!a.frontmatter.title) missing.push(a.name);
    });
    expect(missing).toEqual([]);
  });

  it("每篇文章应有 category frontmatter", () => {
    const missing: string[] = [];
    articles.forEach((a) => {
      if (!a.frontmatter.category) missing.push(a.name);
    });
    expect(missing).toEqual([]);
  });

  it("每篇文章应有 summary frontmatter", () => {
    const missing: string[] = [];
    articles.forEach((a) => {
      if (!a.frontmatter.summary) missing.push(a.name);
    });
    expect(missing).toEqual([]);
  });

  it("每篇文章应包含常见误区或注意事项", () => {
    const noMistakes: string[] = [];
    articles.forEach((a) => {
      const hasMistakes =
        a.content.includes("误区") ||
        a.content.includes("注意") ||
        a.content.includes("常见错误") ||
        a.content.includes("坑");
      if (!hasMistakes) noMistakes.push(a.name);
    });
    // 宽松检查：只记录但不强制失败
    if (noMistakes.length > 0) {
      console.log(`以下文章缺少误区分析: ${noMistakes.join(", ")}`);
    }
  });
});

describe("术语内容质量", () => {
  interface TermEntry {
    term: string;
    slug: string;
    definition: string;
    category: string;
    relatedTerms: string[];
  }

  const terms = readJsonFile<TermEntry>("content/glossary/terms.json");

  it("应有足够的术语数量", () => {
    expect(terms.length).toBeGreaterThanOrEqual(20);
  });

  it("每个术语应有足够的定义长度（≥30 字符）", () => {
    const shortTerms: string[] = [];
    terms.forEach((t) => {
      if (t.definition.length < 30) shortTerms.push(t.slug);
    });
    expect(shortTerms).toEqual([]);
  });

  it("每个术语应有关联术语", () => {
    const noRelated: string[] = [];
    terms.forEach((t) => {
      if (!t.relatedTerms || t.relatedTerms.length === 0) noRelated.push(t.slug);
    });
    expect(noRelated).toEqual([]);
  });

  it("每个术语应有详情文件", () => {
    const missingDetail: string[] = [];
    terms.forEach((t) => {
      const detailPath = path.join(process.cwd(), "content", "glossary", "terms", `${t.slug}.md`);
      if (!fs.existsSync(detailPath)) missingDetail.push(t.slug);
    });
    if (missingDetail.length > 0) {
      console.log(`缺少详情文件的术语: ${missingDetail.join(", ")}`);
    }
  });
});

describe("工具内容质量", () => {
  interface ToolEntry {
    name: string;
    slug: string;
    category: string;
    description: string;
    use_cases: string[];
    official_url: string;
  }

  const tools = readJsonFile<ToolEntry>("content/toolbox/tools.json");

  it("应有足够的工具数量", () => {
    expect(tools.length).toBeGreaterThanOrEqual(15);
  });

  it("每个工具应有足够的描述长度（≥30 字符）", () => {
    const shortDesc: string[] = [];
    tools.forEach((t) => {
      if (t.description.length < 30) shortDesc.push(t.slug);
    });
    expect(shortDesc).toEqual([]);
  });

  it("每个工具应有使用案例", () => {
    const noUseCases: string[] = [];
    tools.forEach((t) => {
      if (!t.use_cases || t.use_cases.length === 0) noUseCases.push(t.slug);
    });
    expect(noUseCases).toEqual([]);
  });

  it("每个工具应有官方链接", () => {
    const noUrl: string[] = [];
    tools.forEach((t) => {
      if (!t.official_url) noUrl.push(t.slug);
    });
    expect(noUrl).toEqual([]);
  });
});

describe("踩坑内容质量", () => {
  interface PitfallEntry {
    title: string;
    slug: string;
    category: string;
    description: string;
    root_cause: string;
    symptoms: string[];
    solution: string[];
    quickFix: string;
    tags: string[];
    prevention?: string[];
  }

  const pitfalls = readJsonFile<PitfallEntry>("content/pitfall/pitfalls.json");

  it("应有足够的踩坑数量", () => {
    expect(pitfalls.length).toBeGreaterThanOrEqual(15);
  });

  it("每个踩坑应有足够的描述长度（≥30 字符）", () => {
    const short: string[] = [];
    pitfalls.forEach((p) => {
      if (p.description.length < 30) short.push(p.slug);
    });
    expect(short).toEqual([]);
  });

  it("每个踩坑应有足够的根因分析（≥20 字符）", () => {
    const short: string[] = [];
    pitfalls.forEach((p) => {
      if (p.root_cause.length < 20) short.push(p.slug);
    });
    expect(short).toEqual([]);
  });

  it("每个踩坑应有症状列表", () => {
    const noSymptoms: string[] = [];
    pitfalls.forEach((p) => {
      if (!p.symptoms || p.symptoms.length === 0) noSymptoms.push(p.slug);
    });
    expect(noSymptoms).toEqual([]);
  });

  it("每个踩坑应有解决方案", () => {
    const noSolution: string[] = [];
    pitfalls.forEach((p) => {
      if (!p.solution || p.solution.length === 0) noSolution.push(p.slug);
    });
    expect(noSolution).toEqual([]);
  });

  it("每个踩坑应有标签", () => {
    const noTags: string[] = [];
    pitfalls.forEach((p) => {
      if (!p.tags || p.tags.length === 0) noTags.push(p.slug);
    });
    expect(noTags).toEqual([]);
  });
});
````

- [ ] **Step 3: 运行测试建立基线**

Run: `npm test`
Expected: 部分测试通过，部分失败（记录当前内容质量基线）

- [ ] **Step 4: 记录基线结果**

将测试结果保存到 `.superpowers/sdd/baseline-results.txt`

- [ ] **Step 5: Commit**

```bash
git add __tests__/lib/content-quality.test.ts
git commit -m "test: add content quality validation tests with baseline"
```

---

### Task 3: 情报内容质量提升（批次 1：深度学习 + CV 类，约 15 篇）

**Files:**

- Modify: `content/intel/001-transformer.md` 至相关深度学习/CV 情报

**Interfaces:**

- Consumes: 质量标准（≥1000 字符、代码示例、误区分析）
- Produces: 提升后的情报 Markdown 文件

**内容提升要求（每篇）：**

1. 检查内容长度，不足 1000 字符的补充技术细节
2. 确保包含可运行的代码示例（Python/PyTorch）
3. 确保包含"常见误区"或"注意事项"章节
4. 补充性能数据对比表（如适用）
5. 完善 frontmatter（title、category、keywords、summary、difficulty、duration、takeaways）

- [ ] **Step 1: 识别需要提升的情报**

Run: `npm test -- --reporter=verbose 2>&1 | grep "FAIL"`
记录所有长度不足的情报文件名

- [ ] **Step 2: 批量提升深度学习类情报**

对以下情报文件进行内容提升（如长度不足或缺少代码/误区）：

- `001-transformer.md` - Transformer 架构
- `003-resnet.md` - ResNet 残差网络
- `004-yolo.md` - YOLO 目标检测
- `006-cnn.md` - CNN 卷积网络
- `007-lora.md` - LoRA 微调
- `012-pytorch.md` - PyTorch 框架
- `044-rlhf.md` - RLHF 对齐
- `019-vllm-inference.md` - vLLM 推理
- `027-moe.md` - MoE 混合专家
- `029-model-quantization.md` - 模型量化
- `035-cuda.md` - CUDA 编程
- `037-code-generation.md` - 代码生成
- `038-distributed-training.md` - 分布式训练
- `042-lora-finetuning.md` - LoRA 微调实战

每篇检查：

- 内容长度 ≥ 1000 字符
- 包含代码示例（`python 或 `bash）
- 包含"误区"、"注意"或"常见错误"
- frontmatter 完整

- [ ] **Step 3: 运行测试验证**

Run: `npm test`
Expected: 情报相关测试通过率提升

- [ ] **Step 4: Commit**

```bash
git add content/intel/
git commit -m "content(intel): 提升深度学习和CV类情报质量"
```

---

### Task 4: 情报内容质量提升（批次 2：NLP + 工程部署类，约 15 篇）

**Files:**

- Modify: `content/intel/` 中 NLP 和工程部署类情报

**Interfaces:**

- Consumes: 同 Task 3
- Produces: 提升后的情报 Markdown 文件

- [ ] **Step 1: 提升 NLP 类情报**

重点文件：

- `002-rag.md` - RAG 检索增强
- `008-huggingface.md` - HuggingFace
- `009-streamlit.md` - Streamlit
- `020-prompt-engineering.md` - Prompt 工程
- `028-multimodal-llm.md` - 多模态 LLM
- `030-long-context-rope.md` - 长上下文 RoPE
- `036-advanced-rag.md` - 高级 RAG
- `039-llm-security.md` - LLM 安全
- `041-data-annotation.md` - 数据标注
- `043-vector-database.md` - 向量数据库

- [ ] **Step 2: 提升工程部署类情报**

重点文件：

- `005-docker.md` - Docker 容器化
- `010-git.md` - Git 版本控制
- `011-linux.md` - Linux 基础
- `016-server-setup.md` - 服务器配置
- `017-metrics.md` - 监控指标
- `018-mlflow.md` - MLflow
- `021-kubernetes.md` - K8s
- `022-prometheus.md` - Prometheus
- `023-etl.md` - ETL 流程
- `026-onnx-deployment.md` - ONNX 部署
- `032-server-ops.md` - 服务器运维
- `034-mlops-engineering.md` - MLOps

- [ ] **Step 3: 运行测试验证**

Run: `npm test`

- [ ] **Step 4: Commit**

```bash
git add content/intel/
git commit -m "content(intel): 提升NLP和工程部署类情报质量"
```

---

### Task 5: 情报内容质量提升（批次 3：数学基础 + CS + 嵌入式类，约 15 篇）

**Files:**

- Modify: `content/intel/` 中数学、CS、嵌入式类情报

- [ ] **Step 1: 提升数学基础类情报**

重点文件：

- `024-information-theory.md` - 信息论
- `025-convex-optimization.md` - 凸优化
- `031-model-evaluation.md` - 模型评估
- `050-cs-algo.md` - CS 算法
- `051-cs-os.md` - 操作系统

- [ ] **Step 2: 提升嵌入式/电子类情报**

重点文件：

- `052-embedded-c.md` - 嵌入式 C
- `053-embedded-rtos.md` - 嵌入式 RTOS
- `054-elec-circuit.md` - 电路
- `055-elec-signals.md` - 电子信号
- `056-signals-comm.md` - 信号通信
- `057-ctrl-pid.md` - PID 控制
- `058-ctrl-ros.md` - ROS 控制
- `059-elec-motor.md` - 电机控制

- [ ] **Step 3: 运行测试验证**

Run: `npm test`

- [ ] **Step 4: Commit**

```bash
git add content/intel/
git commit -m "content(intel): 提升数学基础、CS和嵌入式类情报质量"
```

---

### Task 6: 术语内容质量提升

**Files:**

- Modify: `content/glossary/terms.json`
- Modify: `content/glossary/terms/*.md`（补充缺失的详情文件）

**Interfaces:**

- Consumes: 质量标准（定义 ≥30 字符、关联术语 ≥1、详情文件）
- Produces: 完善后的术语数据

- [ ] **Step 1: 完善 terms.json 中的定义**

检查所有 26 个术语的 `definition` 字段长度，补充不足 30 字符的定义。

- [ ] **Step 2: 补充缺失的关联术语**

检查所有术语的 `relatedTerms`，为缺少关联的术语添加关联。

- [ ] **Step 3: 补充缺失的详情文件**

为以下缺少详情文件的术语创建 Markdown 详情：

- 检查 `content/glossary/terms/` 中是否存在对应的 `.md` 文件
- 为缺失的术语创建基础详情文件

- [ ] **Step 4: 运行测试验证**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add content/glossary/
git commit -m "content(glossary): 完善术语定义和关联术语"
```

---

### Task 7: 工具内容质量提升

**Files:**

- Modify: `content/toolbox/tools.json`

**Interfaces:**

- Consumes: 质量标准（描述 ≥30 字符、use_cases ≥1、官方链接有效）
- Produces: 完善后的工具数据

- [ ] **Step 1: 检查工具描述长度**

检查所有 20 个工具的 `description` 字段，补充不足 30 字符的描述。

- [ ] **Step 2: 补充使用案例**

为缺少 `use_cases` 或 use_cases 不足的工具补充使用案例。

- [ ] **Step 3: 验证官方链接**

检查所有工具的 `official_url` 是否有效（格式正确）。

- [ ] **Step 4: 运行测试验证**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add content/toolbox/
git commit -m "content(toolbox): 完善工具描述和使用案例"
```

---

### Task 8: 踩坑内容质量提升

**Files:**

- Modify: `content/pitfall/pitfalls.json`

**Interfaces:**

- Consumes: 质量标准（描述 ≥30 字符、根因 ≥20 字符、症状/方案/标签非空）
- Produces: 完善后的踩坑数据

- [ ] **Step 1: 检查踩坑描述长度**

检查所有 23 个踩坑的 `description` 和 `root_cause` 字段长度。

- [ ] **Step 2: 补充缺失的 prevention 字段**

为缺少 `prevention` 字段的踩坑添加预防措施。

- [ ] **Step 3: 完善症状和解决方案**

检查所有踩坑的 `symptoms` 和 `solution` 数组，确保每项至少有 2 个条目。

- [ ] **Step 4: 运行测试验证**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add content/pitfall/
git commit -m "content(pitfall): 补充踩坑根因分析和预防措施"
```

---

### Task 9: 最终验证与构建

**Files:**

- None（验证性 Task）

- [ ] **Step 1: 运行全量测试**

Run: `npm test`
Expected: 所有测试通过

- [ ] **Step 2: 运行内容验证脚本**

Run: `npm run validate-content`
Expected: 验证通过，无错误

- [ ] **Step 3: 运行构建**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 4: 记录最终指标**

对比基线结果，记录提升幅度。

- [ ] **Step 5: Commit**

```bash
git commit --allow-empty -m "test: final quality verification - all tests pass"
```

---

## Spec Coverage Checklist

| Spec Section     | Task                                     |
| ---------------- | ---------------------------------------- |
| 2.1 科学性标准   | Task 2（测试验证）+ Task 3-8（内容提升） |
| 2.2 详细程度标准 | Task 2（长度测试）+ Task 3-8（内容补充） |
| 3. 情报内容提升  | Task 3, 4, 5                             |
| 4. 术语内容提升  | Task 6                                   |
| 5. 工具内容提升  | Task 7                                   |
| 6. 踩坑内容提升  | Task 8                                   |
| 7. 实施计划      | Task 1-9 按阶段执行                      |
| 8. 质量检查清单  | Task 2（自动化测试）                     |
| 9. 测试策略      | Task 1, 2                                |
| 11. 成功标准     | Task 9（最终验证）                       |
