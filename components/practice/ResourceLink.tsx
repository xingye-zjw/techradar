'use client';

import { ResourceLink as ResourceLinkType } from '@/lib/content-types';

interface ResourceLinkProps {
  resource: ResourceLinkType;
}

const typeIcons: Record<string, string> = {
  paper: '📄',
  article: '📝',
  course: '📚',
  documentation: '📖',
  video: '🎬',
};

const typeLabels: Record<string, string> = {
  paper: '论文',
  article: '文章',
  course: '课程',
  documentation: '文档',
  video: '视频',
};

export function ResourceLink({ resource }: ResourceLinkProps) {
  const icon = typeIcons[resource.type] || '📎';
  const label = typeLabels[resource.type] || resource.type;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-emerald-500/30 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zinc-200 truncate">
          {resource.title}
        </div>
        <div className="text-xs text-zinc-500">{label}</div>
      </div>
      <svg
        className="w-4 h-4 text-zinc-500 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
