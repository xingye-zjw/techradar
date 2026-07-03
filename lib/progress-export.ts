"use client";

/**
 * 学习进度导入/导出管理
 * 支持 JSON 格式的进度数据导入导出
 */

const STORAGE_PREFIX = "techradar_progress_";
const LEGACY_STORAGE_KEY = "techradar-roadmap-progress";
const TASK_STORAGE_KEY = "techradar-task-progress";

export interface ProgressData {
  version: string;
  exportedAt: string;
  nodes: Record<string, {
    completedDays: number[];
    lastUpdated: string;
  }>;
  nodeStatus: Record<string, string>;
  taskProgress: Record<string, Record<number, boolean>>;
}

/**
 * 导出所有学习进度
 */
export function exportProgress(): ProgressData {
  const nodes: ProgressData["nodes"] = {};
  const nodeStatus: ProgressData["nodeStatus"] = {};

  // 从新格式读取
  if (typeof window !== "undefined") {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const nodeId = key.replace(STORAGE_PREFIX, "");
        try {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          nodes[nodeId] = {
            completedDays: data.completedDays || [],
            lastUpdated: data.lastUpdated || "",
          };
        } catch (e) {
          console.error(`Failed to parse progress for ${nodeId}:`, e);
        }
      }
    }

    // 从旧格式读取
    try {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const legacyData = JSON.parse(legacy);
        Object.entries(legacyData).forEach(([id, status]) => {
          nodeStatus[id] = status as string;
        });
      }
    } catch (e) {
      // 忽略
    }

    // 读取任务进度
    try {
      const taskProgress = localStorage.getItem(TASK_STORAGE_KEY);
      if (taskProgress) {
        var taskData = JSON.parse(taskProgress);
        return {
          version: "1.0",
          exportedAt: new Date().toISOString(),
          nodes,
          nodeStatus,
          taskProgress: taskData,
        };
      }
    } catch (e) {
      // 忽略
    }
  }

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    nodes,
    nodeStatus,
    taskProgress: {},
  };
}

/**
 * 导入学习进度
 */
export function importProgress(data: ProgressData): { success: boolean; imported: number; errors: string[] } {
  const errors: string[] = [];
  let imported = 0;

  if (typeof window === "undefined") {
    return { success: false, imported: 0, errors: ["无法在服务端导入进度"] };
  }

  try {
    // 导入节点进度
    if (data.nodes) {
      Object.entries(data.nodes).forEach(([nodeId, nodeData]) => {
        try {
          const key = `${STORAGE_PREFIX}${nodeId}`;
          localStorage.setItem(key, JSON.stringify({
            completedDays: nodeData.completedDays || [],
            lastUpdated: nodeData.lastUpdated || new Date().toISOString(),
          }));
          imported++;
        } catch (e) {
          errors.push(`导入节点 ${nodeId} 失败: ${e}`);
        }
      });
    }

    // 导入节点状态
    if (data.nodeStatus) {
      try {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data.nodeStatus));
      } catch (e) {
        errors.push(`导入节点状态失败: ${e}`);
      }
    }

    // 导入任务进度
    if (data.taskProgress) {
      try {
        localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(data.taskProgress));
      } catch (e) {
        errors.push(`导入任务进度失败: ${e}`);
      }
    }

    return { success: errors.length === 0, imported, errors };
  } catch (e) {
    return { success: false, imported: 0, errors: [`导入失败: ${e}`] };
  }
}

/**
 * 清除所有学习进度
 */
export function clearAllProgress(): void {
  if (typeof window === "undefined") return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(STORAGE_PREFIX) || key === LEGACY_STORAGE_KEY || key === TASK_STORAGE_KEY)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * 下载进度为 JSON 文件
 */
export function downloadProgress(): void {
  const data = exportProgress();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `techradar-progress-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 从文件导入进度
 */
export async function importFromFile(file: File): Promise<{ success: boolean; imported: number; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        const result = importProgress(data);
        resolve(result);
      } catch (err) {
        resolve({ success: false, imported: 0, errors: [`文件解析失败: ${err}`] });
      }
    };
    reader.onerror = () => {
      resolve({ success: false, imported: 0, errors: ["文件读取失败"] });
    };
    reader.readAsText(file);
  });
}
