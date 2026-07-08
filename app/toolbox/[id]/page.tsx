import Link from "next/link";
import { notFound } from "next/navigation";
import { getToolboxData, getToolId, type Tool } from "@/lib/toolbox";

// 情报数据映射
const INTEL_MAP: Record<string, { title: string; slug: string }> = {
  "001-transformer": { title: "Transformer 架构详解", slug: "001-transformer" },
  "002-yolo": { title: "YOLO 目标检测", slug: "002-yolo" },
  "003-lora-qlora": { title: "LoRA/QLoRA 微调", slug: "003-lora-qlora" },
  "004-resnet": { title: "ResNet 残差网络", slug: "004-resnet" },
  "005-rag": { title: "RAG 检索增强生成", slug: "005-rag" },
  "006-cnn-basics": { title: "CNN 基础", slug: "006-cnn-basics" },
  "007-docker": { title: "Docker 容器化", slug: "007-docker" },
  "008-git": { title: "Git 版本控制", slug: "008-git" },
  "009-linux": { title: "Linux 系统", slug: "009-linux" },
  "010-numpy-pandas": { title: "NumPy/Pandas", slug: "010-numpy-pandas" },
  "011-pytorch": { title: "PyTorch 框架", slug: "011-pytorch" },
  "012-streamlit": { title: "Streamlit", slug: "012-streamlit" },
  "013-huggingface-datasets": { title: "HuggingFace Datasets", slug: "013-huggingface-datasets" },
  "014-onnx": { title: "ONNX 部署", slug: "014-onnx" },
  "015-rlhf": { title: "RLHF 对齐", slug: "015-rlhf" },
  "016-server-setup": { title: "服务器配置", slug: "016-server-setup" },
  "017-metrics": { title: "评估指标", slug: "017-metrics" },
  "018-mlflow": { title: "MLflow 实验管理", slug: "018-mlflow" },
};

// 节点数据映射
const NODE_MAP: Record<string, { name: string; id: string }> = {
  "linux-basic": { name: "Linux 系统基础", id: "linux-basic" },
  "git-github": { name: "Git & GitHub 协作", id: "git-github" },
  "docker-basic": { name: "Docker 容器化", id: "docker-basic" },
  "math-linear-algebra": { name: "线性代数", id: "math-linear-algebra" },
  "math-probability": { name: "概率与统计", id: "math-probability" },
  "pytorch-core": { name: "PyTorch 框架", id: "pytorch-core" },
  "cv-cnn": { name: "CNN 经典架构", id: "cv-cnn" },
  "cv-detection": { name: "目标检测", id: "cv-detection" },
  "nlp-rnn": { name: "NLP 基础与 RNN", id: "nlp-rnn" },
  "nlp-transformer": { name: "Transformer 与预训练模型", id: "nlp-transformer" },
  "llm-finetune": { name: "LLM 微调与对齐", id: "llm-finetune" },
  "project-capstone": { name: "综合实战项目", id: "project-capstone" },
};

interface ToolDetailPageProps {
  params: { id: string };
}

export function generateStaticParams() {
  const data = getToolboxData();
  return data.tools.map((tool) => ({
    id: getToolId(tool),
  }));
}

export default function ToolDetailPage({ params }: ToolDetailPageProps) {
  const data = getToolboxData();
  const tool = data.tools.find((t) => getToolId(t) === params.id);

  if (!tool) {
    notFound();
  }

  const difficultyLabels: Record<string, { label: string; color: string }> = {
    beginner: { label: "入门", color: "bg-green-500/15 text-green-400 border-green-500/30" },
    intermediate: { label: "进阶", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
    advanced: { label: "高级", color: "bg-red-500/15 text-red-400 border-red-500/30" },
  };

  const diff = difficultyLabels[tool.difficulty] || difficultyLabels.intermediate;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* 面包屑 */}
        <div className="flex items-center gap-2 mb-8 font-mono text-xs text-neutral-500">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            首页
          </Link>
          <span>/</span>
          <Link href="/toolbox" className="hover:text-cyan-400 transition-colors">
            工具箱
          </Link>
          <span>/</span>
          <span className="text-neutral-300">{tool.name}</span>
        </div>

        {/* 工具头部 */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
              {tool.category}
            </span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${diff.color}`}>
              {diff.label}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{tool.name}</h1>
          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed">{tool.purpose}</p>
        </div>

        {/* 快速信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* 安装命令 */}
          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
            <h3 className="font-mono text-[10px] text-neutral-500 uppercase mb-2">安装命令</h3>
            <code className="block p-3 bg-neutral-950 rounded text-sm text-cyan-400 font-mono break-all overflow-x-auto">
              {tool.install}
            </code>
          </div>

          {/* GitHub 信息 */}
          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
            <h3 className="font-mono text-[10px] text-neutral-500 uppercase mb-2">GitHub</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <a
                href={tool.github.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline text-sm"
              >
                查看仓库 →
              </a>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-neutral-500">⭐ {tool.github.stars}</span>
                <span className="font-mono text-xs text-neutral-500">
                  📦 {tool.github.last_release}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 核心特性 */}
        <section className="mb-8">
          <h2 className="font-mono text-sm text-neutral-500 uppercase mb-4">{"// 核心特性"}</h2>
          <ul className="space-y-2">
            {tool.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 bg-neutral-900 rounded-lg border border-neutral-800"
              >
                <span className="text-emerald-400 font-mono mt-0.5">✓</span>
                <span className="text-sm text-neutral-300">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 使用场景 */}
        <section className="mb-8">
          <h2 className="font-mono text-sm text-neutral-500 uppercase mb-4">{"// 使用场景"}</h2>
          <div className="flex flex-wrap gap-2">
            {tool.use_cases.map((uc, idx) => (
              <span
                key={idx}
                className="font-mono text-xs px-3 py-1.5 bg-neutral-900 text-neutral-400 rounded border border-neutral-800"
              >
                {uc}
              </span>
            ))}
          </div>
        </section>

        {/* 关联情报 */}
        {tool.relatedIntel && tool.relatedIntel.length > 0 && (
          <section className="mb-8">
            <h2 className="font-mono text-sm text-neutral-500 uppercase mb-4">
              {"// 📰 关联情报"}
            </h2>
            <div className="space-y-3">
              {tool.relatedIntel.map((slug) => {
                const intel = INTEL_MAP[slug];
                if (!intel) return null;
                return (
                  <Link
                    key={slug}
                    href={`/intel/${intel.slug}`}
                    className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
                  >
                    <span className="text-cyan-400 text-lg">📰</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-neutral-200 group-hover:text-cyan-400 transition-colors">
                        {intel.title}
                      </span>
                    </div>
                    <span className="text-neutral-600 group-hover:text-cyan-400 transition-colors">
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 关联路线图节点 */}
        {tool.relatedNodes && tool.relatedNodes.length > 0 && (
          <section className="mb-8">
            <h2 className="font-mono text-sm text-neutral-500 uppercase mb-4">
              {"// 📊 关联路线图节点"}
            </h2>
            <div className="space-y-3">
              {tool.relatedNodes.map((nodeId) => {
                const node = NODE_MAP[nodeId];
                if (!node) return null;
                return (
                  <Link
                    key={nodeId}
                    href={`/roadmap?node=${nodeId}`}
                    className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                  >
                    <span className="text-emerald-400 text-lg">📊</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-neutral-200 group-hover:text-emerald-400 transition-colors">
                        {node.name}
                      </span>
                    </div>
                    <span className="text-neutral-600 group-hover:text-emerald-400 transition-colors">
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 标签 */}
        <section className="mb-8">
          <h2 className="font-mono text-sm text-neutral-500 uppercase mb-4">{"// 标签"}</h2>
          <div className="flex flex-wrap gap-2">
            {tool.tags.map((tag, idx) => (
              <span
                key={idx}
                className="font-mono text-xs px-3 py-1.5 bg-neutral-900 text-neutral-400 rounded border border-neutral-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>

        {/* 官方链接 */}
        <section className="mb-8">
          <a
            href={tool.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 rounded-lg hover:bg-cyan-400/20 transition-colors"
          >
            <span>访问官方文档</span>
            <span>→</span>
          </a>
        </section>

        {/* 返回 */}
        <div className="pt-6 border-t border-neutral-800">
          <Link
            href="/toolbox"
            className="font-mono text-sm text-neutral-500 hover:text-cyan-400 transition-colors"
          >
            ← 返回工具箱
          </Link>
        </div>
      </div>
    </main>
  );
}
