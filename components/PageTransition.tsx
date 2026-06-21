"use client";

import { useEffect, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  /** 动画持续时间（毫秒） */
  duration?: number;
}

/**
 * 页面过渡动画组件
 * 使用 CSS transition 实现淡入淡出效果
 */
export function PageTransition({ children, duration = 200 }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 组件挂载后触发动画
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className="transition-all ease-in-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(8px)",
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * 路由切换动画包装器
 * 用于包裹页面内容，实现路由切换时的动画效果
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
      {children}
    </div>
  );
}
