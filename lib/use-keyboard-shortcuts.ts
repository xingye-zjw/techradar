"use client";

/**
 * 键盘快捷键 Hook
 * 支持全局快捷键和组件级快捷键
 */

import { useEffect, useCallback } from "react";

export interface KeyboardShortcuts {
  toggleRoadmap?: () => void;
  toggleSearch?: () => void;
  goHome?: () => void;
  closePanel?: () => void;
  toggleNodeComplete?: () => void;
  nextNode?: () => void;
  prevNode?: () => void;
  zoomIn?: () => void;
  zoomOut?: () => void;
  resetView?: () => void;
  showShortcuts?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 忽略输入框中的快捷键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // 修饰键组合
      const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + K - 搜索
      if (modKey && e.key === "k") {
        e.preventDefault();
        shortcuts.toggleSearch?.();
        return;
      }

      // 单键快捷键
      if (!modKey && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case "Escape":
            e.preventDefault();
            shortcuts.closePanel?.();
            break;
          case " ":
            e.preventDefault();
            shortcuts.toggleNodeComplete?.();
            break;
          case "ArrowRight":
          case "n":
          case "j":
            e.preventDefault();
            shortcuts.nextNode?.();
            break;
          case "ArrowLeft":
          case "p":
          case "k":
            e.preventDefault();
            shortcuts.prevNode?.();
            break;
          case "+":
          case "=":
            e.preventDefault();
            shortcuts.zoomIn?.();
            break;
          case "-":
            e.preventDefault();
            shortcuts.zoomOut?.();
            break;
          case "0":
            e.preventDefault();
            shortcuts.resetView?.();
            break;
          case "?":
            e.preventDefault();
            shortcuts.showShortcuts?.();
            break;
          case "g":
            if (e.shiftKey) {
              e.preventDefault();
              shortcuts.goHome?.();
            }
            break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * 快捷键说明
 */
export const SHORTCUT_GROUPS = [
  {
    title: "导航",
    shortcuts: [
      { keys: ["G", "H"], desc: "返回首页" },
      { keys: ["Ctrl/Cmd", "K"], desc: "打开搜索" },
      { keys: ["Esc"], desc: "关闭面板" },
    ],
  },
  {
    title: "节点操作",
    shortcuts: [
      { keys: ["Space"], desc: "切换完成" },
      { keys: ["→", "N"], desc: "下一个节点" },
      { keys: ["←", "P"], desc: "上一个节点" },
    ],
  },
  {
    title: "视图",
    shortcuts: [
      { keys: ["+"], desc: "放大" },
      { keys: ["-"], desc: "缩小" },
      { keys: ["0"], desc: "重置视图" },
      { keys: ["?"], desc: "显示快捷键" },
    ],
  },
];
