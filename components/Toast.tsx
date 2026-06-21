"use client";

import { useEffect, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

// 简单的 Toast 状态管理（不使用 Context，直接导出函数）
let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener([...toasts]);
  }
}

export function addToast(type: ToastType, message: string, duration: number = 3000) {
  const id = Math.random().toString(36).slice(2, 9);
  const newToast: Toast = { id, type, message, duration };
  toasts = [...toasts, newToast];
  emitChange();

  // 自动移除
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
}

function useToasts() {
  const [state, setState] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setState);
    emitChange();
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);

  return state;
}

/**
 * Toast 容器组件
 * 放置在页面中，自动显示 Toast 消息
 */
export function ToastContainer() {
  const toasts = useToasts();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 入场动画
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 200);
  }, [toast.id, onRemove]);

  const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      icon: "✓",
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: "✕",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      icon: "⚠",
    },
    info: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      icon: "ℹ",
    },
  };

  const style = typeStyles[toast.type];

  return (
    <div
      className={`
        pointer-events-auto
        ${style.bg} ${style.border}
        border rounded-lg shadow-lg
        px-4 py-3 min-w-[250px] max-w-[350px]
        transition-all duration-200 ease-in-out
        ${isVisible && !isLeaving ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
      `}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <span
          className={`
            flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
            ${toast.type === "success" ? "bg-emerald-500/20 text-emerald-400" : ""}
            ${toast.type === "error" ? "bg-red-500/20 text-red-400" : ""}
            ${toast.type === "warning" ? "bg-amber-500/20 text-amber-400" : ""}
            ${toast.type === "info" ? "bg-cyan-500/20 text-cyan-400" : ""}
          `}
        >
          {style.icon}
        </span>

        {/* 消息内容 */}
        <p className="flex-1 text-sm text-zinc-200">{toast.message}</p>

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * 便捷的 Toast 调用函数
 */
export const toast = {
  success: (message: string, duration?: number) => addToast("success", message, duration),
  error: (message: string, duration?: number) => addToast("error", message, duration),
  warning: (message: string, duration?: number) => addToast("warning", message, duration),
  info: (message: string, duration?: number) => addToast("info", message, duration),
};
