import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "实战项目 - TechRadar 极客雷达",
  description: "动手做项目：图像分类、RAG 应用、LLM Agent、数据管道、IoT 控制系统等 6+ 完整实战项目。",
  keywords: ["实战项目", "AI项目", "RAG", "LLM Agent", "IoT", "数据管道"],
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}