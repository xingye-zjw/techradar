"use client";

interface SkeletonProps {
  /** 宽度 */
  width?: string;
  /** 高度 */
  height?: string;
  /** 是否为圆形 */
  circle?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 骨架屏组件
 * 用于加载状态的占位符
 */
export function Skeleton({ width, height, circle = false, className = "" }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${circle ? "rounded-full" : "rounded"} ${className}`}
      style={{
        width: width || "100%",
        height: height || "1rem",
      }}
    />
  );
}

/**
 * 卡片骨架屏
 */
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3 ${className}`}>
      <Skeleton width="60%" height="1.25rem" />
      <Skeleton width="100%" height="0.875rem" />
      <Skeleton width="80%" height="0.875rem" />
      <div className="flex gap-2 pt-2">
        <Skeleton width="4rem" height="1.5rem" className="rounded-full" />
        <Skeleton width="5rem" height="1.5rem" className="rounded-full" />
      </div>
    </div>
  );
}

/**
 * 列表项骨架屏
 */
export function ListItemSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-950 ${className}`}>
      <Skeleton width="2.5rem" height="2.5rem" circle />
      <div className="flex-1 space-y-2">
        <Skeleton width="70%" height="1rem" />
        <Skeleton width="50%" height="0.75rem" />
      </div>
    </div>
  );
}

/**
 * 每日任务骨架屏
 */
export function DailyTaskSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Skeleton width="2rem" height="2rem" className="rounded" />
        <Skeleton width="60%" height="1rem" />
      </div>
      <Skeleton width="100%" height="0.875rem" />
      <Skeleton width="90%" height="0.875rem" />
      <Skeleton width="80%" height="0.875rem" />
      <div className="pt-2 border-t border-neutral-800/50">
        <Skeleton width="40%" height="0.75rem" />
      </div>
    </div>
  );
}

/**
 * 情报卡片骨架屏
 */
export function IntelCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-neutral-800 bg-neutral-950 p-5 space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Skeleton width="3rem" height="1.5rem" className="rounded-full" />
        <Skeleton width="4rem" height="1.5rem" className="rounded-full" />
      </div>
      <Skeleton width="80%" height="1.25rem" />
      <Skeleton width="100%" height="0.875rem" />
      <Skeleton width="60%" height="0.875rem" />
      <div className="flex gap-2 pt-2">
        <Skeleton width="3rem" height="1.5rem" className="rounded-full" />
        <Skeleton width="3.5rem" height="1.5rem" className="rounded-full" />
        <Skeleton width="4rem" height="1.5rem" className="rounded-full" />
      </div>
    </div>
  );
}

/**
 * 工具卡片骨架屏
 */
export function ToolCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton width="2.5rem" height="2.5rem" circle />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="1rem" />
          <Skeleton width="40%" height="0.75rem" />
        </div>
      </div>
      <Skeleton width="100%" height="0.875rem" />
      <Skeleton width="80%" height="0.875rem" />
    </div>
  );
}

/**
 * 搜索结果骨架屏
 */
export function SearchResultSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border border-neutral-800 bg-neutral-950 ${className}`}>
      <Skeleton width="2rem" height="2rem" circle />
      <div className="flex-1 space-y-2">
        <Skeleton width="70%" height="1rem" />
        <Skeleton width="90%" height="0.75rem" />
        <Skeleton width="50%" height="0.75rem" />
      </div>
    </div>
  );
}
