import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "技术情报 - TechRadar 极客雷达",
  description: "AI 前沿技术情报：Transformer、YOLO、LoRA、RAG、Agent、扩散模型、强化学习对齐等 100+ 深度文章。",
  keywords: ["技术情报", "AI技术", "Transformer", "RAG", "Agent", "扩散模型"],
};

export default function IntelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}