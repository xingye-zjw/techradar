'use client';

import Link from 'next/link';
import { PracticeProject } from '@/lib/content-types';
import { DifficultyBadge } from './DifficultyBadge';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: PracticeProject;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <Link
      href={`/practice/${project.slug}`}
      className={cn(
        'block p-6 rounded-xl border border-zinc-800 bg-zinc-900/50',
        'hover:border-emerald-500/50 hover:bg-zinc-900/80 transition-all duration-200',
        'hover-lift group',
        className
      )}
    >
      {/* 卡片头部 */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
          {project.title}
        </h3>
        <DifficultyBadge difficulty={project.difficulty} showLabel={false} />
      </div>

      {/* 项目元信息 */}
      <div className="flex items-center gap-4 text-sm text-zinc-500 mb-3">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {project.duration}
        </span>
        {project.relatedNodes && project.relatedNodes.length > 0 && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {project.relatedNodes.length} 个关联节点
          </span>
        )}
      </div>

      {/* 项目简介 */}
      <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2">
        {project.summary}
      </p>

      {/* 前置知识标签 */}
      <div className="flex flex-wrap gap-2">
        {project.prerequisites.slice(0, 3).map((prereq, i) => (
          <span
            key={i}
            className="px-2 py-1 text-xs rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
          >
            {prereq}
          </span>
        ))}
        {project.prerequisites.length > 3 && (
          <span className="px-2 py-1 text-xs rounded-md bg-zinc-800/80 text-zinc-500">
            +{project.prerequisites.length - 3}
          </span>
        )}
      </div>
    </Link>
  );
}
