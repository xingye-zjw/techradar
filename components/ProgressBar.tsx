"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  current,
  total,
  showLabel = true,
  className = "",
  size = "md",
}: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={`w-full ${className}`} role="group" aria-label="学习进度">
      {showLabel && (
        <div className="flex justify-between font-mono text-[10px] text-neutral-500 mb-1">
          <span>进度</span>
          <span>
            {current}/{total} 天 ({percent}%)
          </span>
        </div>
      )}
      <div
        className={`w-full bg-neutral-800 rounded-full overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`学习进度 ${current}/${total} 天`}
      >
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/**
 * 简化的进度条组件（无交互功能）
 */
interface SimpleProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function SimpleProgressBar({
  current,
  total,
  className = "",
}: SimpleProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between font-mono text-[10px] text-neutral-500 mb-1">
        <span>每日任务进度</span>
        <span>
          {current}/{total} 天 ({percent}%)
        </span>
      </div>
      <div
        className="h-1.5 bg-neutral-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
