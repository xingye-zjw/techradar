import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "术语表 - TechRadar 极客雷达",
  description: "AI 与技术核心术语速查：Transformer、CNN、RAG、RLHF、CUDA、LoRA、扩散模型等 100+ 概念详解。",
  keywords: ["技术术语", "AI术语", "Transformer", "CNN", "RAG", "深度学习"],
};

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}