'use client';

import { cn } from '@/lib/utils';
import type { LearningPath } from '@/lib/learning-paths';

interface PathSelectorProps {
  paths: LearningPath[];
  selectedPath: LearningPath | null;
  onSelectPath: (path: LearningPath | null) => void;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  cv: '计算机视觉',
  nlp: '自然语言处理',
  devops: '工程部署',
  math: '数学基础',
};

const categoryColors: Record<string, string> = {
  cv: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  nlp: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  devops: 'bg-green-500/10 text-green-400 border-green-500/30',
  math: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
};

export function PathSelector({ paths, selectedPath, onSelectPath, className }: PathSelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-neutral-500 uppercase">学习路径</span>
        {selectedPath && (
          <button
            onClick={() => onSelectPath(null)}
            className="font-mono text-[10px] text-red-400 hover:text-red-300 transition-colors"
          >
            清除选择
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {paths.map((path) => (
          <button
            key={path.id}
            onClick={() => onSelectPath(selectedPath?.id === path.id ? null : path)}
            className={cn(
              'text-left p-3 rounded-lg border transition-all',
              selectedPath?.id === path.id
                ? `${categoryColors[path.category]} border-current`
                : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-600'
            )}
          >
            <div className={cn(
              'font-mono text-[10px] uppercase mb-1',
              selectedPath?.id === path.id ? '' : 'text-neutral-500'
            )}>
              {categoryLabels[path.category]}
            </div>
            <div className="text-sm font-semibold text-neutral-200 mb-1">
              {path.name}
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500">
              <span>⏱️ {path.duration}</span>
              <span>•</span>
              <span>{path.difficulty === 'beginner' ? '初级' : path.difficulty === 'intermediate' ? '中级' : '高级'}</span>
            </div>
          </button>
        ))}
      </div>

      {/* 选中路径的详细信息 */}
      {selectedPath && (
        <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
          <h4 className="text-sm font-semibold text-neutral-200 mb-2">{selectedPath.name}</h4>
          <p className="text-xs text-neutral-400 mb-3">{selectedPath.description}</p>
          <div className="flex flex-wrap gap-2">
            {selectedPath.nodes.map((nodeId, idx) => (
              <span key={nodeId} className="font-mono text-[10px] px-2 py-1 bg-neutral-800 text-neutral-400 rounded border border-neutral-700">
                {idx + 1}. {nodeId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
