'use client';

import { cn } from '@/lib/utils';
import { FULL_ROADMAP } from '@/lib/roadmap-data';
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
  cs: '计算机基础',
  embedded: '嵌入式开发',
  electronics: '电子电路',
  signals: '通信信号',
  control: '自动化控制',
  electrical: '电气工程',
  project: '综合项目',
};

const categoryColors: Record<string, string> = {
  cv: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  nlp: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  devops: 'bg-green-500/10 text-green-400 border-green-500/30',
  math: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  cs: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  embedded: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  electronics: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  signals: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  control: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  electrical: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  project: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
};

// 获取节点名称
function getNodeName(nodeId: string): string {
  const node = FULL_ROADMAP.find(n => n.id === nodeId);
  return node?.name || nodeId;
}

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
          <div className="mb-3">
            <span className="font-mono text-[10px] text-neutral-500 uppercase mb-2 block">学习节点</span>
            <div className="flex flex-wrap gap-2">
              {selectedPath.nodes.map((nodeId, idx) => (
                <span
                  key={nodeId}
                  className="font-mono text-[11px] px-2.5 py-1.5 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/30 flex items-center gap-1.5"
                >
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  {getNodeName(nodeId)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-neutral-500">
            <span>⏱️ 总时长：{selectedPath.duration}</span>
            <span>📊 难度：{selectedPath.difficulty === 'beginner' ? '初级' : selectedPath.difficulty === 'intermediate' ? '中级' : '高级'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
