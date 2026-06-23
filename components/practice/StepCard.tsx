'use client';

import { useState } from 'react';
import { ProjectStep } from '@/lib/content-types';
import { cn } from '@/lib/utils';

interface StepCardProps {
  step: ProjectStep;
  isLast?: boolean;
}

export function StepCard({ step, isLast = false }: StepCardProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className={cn('relative pl-8', !isLast && 'pb-8')}>
      {/* 步骤连线 */}
      {!isLast && (
        <div className="absolute left-3 top-8 bottom-0 w-px bg-zinc-700" />
      )}

      {/* 步骤圆点 */}
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
        <span className="text-xs font-bold text-emerald-400">{step.order}</span>
      </div>

      {/* 步骤内容 */}
      <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
        <h4 className="text-base font-semibold text-zinc-100 mb-2">
          {step.title}
        </h4>
        <p className="text-sm text-zinc-400 leading-relaxed mb-3">
          {step.description}
        </p>

        {/* 代码示例 */}
        {step.code && (
          <div className="bg-zinc-800 rounded-md p-3 mb-3 overflow-x-auto">
            <code className="text-sm text-cyan-400 font-mono">{step.code}</code>
          </div>
        )}

        {/* 提示 */}
        {step.hint && (
          <div>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              {showHint ? '收起提示 ▲' : '查看提示 ▼'}
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-sm text-yellow-400">💡 {step.hint}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
