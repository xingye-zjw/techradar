import type { Metadata } from "next";
import { getAllPitfalls } from "@/lib/pitfall";
import { PitfallListClient } from "@/components/pitfall/PitfallListClient";

export const metadata: Metadata = {
  title: "踩坑避雷 - TechRadar 极客雷达",
  description: "AI 开发常见踩坑案例：CUDA OOM、训练不收敛、RAG 检索幻觉、嵌入式 C 指针越界、PID 调参振荡等 100+ 实战经验。",
  keywords: ["踩坑", "避雷", "CUDA", "深度学习", "RAG", "嵌入式", "调试"],
};

export default function PitfallPage() {
  const pitfalls = getAllPitfalls();
  return <PitfallListClient pitfalls={pitfalls} />;
}
