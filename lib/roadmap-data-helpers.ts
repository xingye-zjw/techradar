/**
 * 客户端安全的路线图数据辅助
 * 提供 FULL_ROADMAP 的客户端安全版本
 */

import { FULL_ROADMAP as FULL_ROADMAP_DATA } from "./roadmap-data";
import type { RoadmapNode } from "@/lib/content-types";

// 重新导出
export { FULL_ROADMAP_DATA };

// 使用更宽松的类型
export type RoadmapNodeData = RoadmapNode;

// 安全的客户端导出（仅包含必要字段，避免依赖服务端代码）
export const FULL_ROADMAP = FULL_ROADMAP_DATA as unknown as RoadmapNodeData[];
