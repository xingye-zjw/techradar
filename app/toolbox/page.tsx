import type { Metadata } from "next";
import { getToolCategories, getToolboxDataWithRelated } from "@/lib/toolbox";
import { ToolboxClient } from "./ToolboxClient";

export const metadata: Metadata = {
  title: "工具箱 - TechRadar 极客雷达",
  description: "精选 AI 开发者必备工具：PyTorch、Transformers、YOLO、Docker、Kubernetes 等 50+ 工具的详细介绍和使用场景。",
  keywords: ["AI工具", "开发工具", "PyTorch", "Transformers", "Docker", "Kubernetes"],
};

export default function ToolboxPage() {
  const data = getToolboxDataWithRelated();
  const categories = getToolCategories();
  return <ToolboxClient tools={data.tools} scenarios={data.scenarios} categories={categories} />;
}
