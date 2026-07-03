import type { Metadata } from "next";
import { getUnifiedSearchIndex } from "@/lib/search";
import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = {
  title: "搜索 - TechRadar 极客雷达",
  description: "在 TechRadar 中搜索术语、情报、工具、踩坑案例和路线图节点。",
  keywords: ["搜索", "技术检索"],
};

export default function SearchPage() {
  const index = getUnifiedSearchIndex();
  return <SearchPageClient items={index} />;
}
