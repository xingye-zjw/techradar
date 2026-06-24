'use client';

import { PracticeProject } from '@/lib/content-types';
import { DifficultyBadge } from './DifficultyBadge';
import { StepCard } from './StepCard';
import { ResourceLink } from './ResourceLink';
import Link from 'next/link';

interface ProjectDetailProps {
  project: PracticeProject;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回链接 */}
      <Link
        href="/practice"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回项目列表
      </Link>

      {/* 项目标题 */}
      <h1 className="text-3xl font-bold text-zinc-100 mb-6">
        {project.title}
      </h1>

      {/* 项目概览 */}
      <section className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <span>📋</span> 项目概览
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-zinc-500 block mb-1">难度</span>
            <DifficultyBadge difficulty={project.difficulty} />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block mb-1">时长</span>
            <span className="text-sm text-zinc-300">{project.duration}</span>
          </div>
          <div className="col-span-2">
            <span className="text-xs text-zinc-500 block mb-1">前置知识</span>
            <div className="flex flex-wrap gap-2">
              {project.prerequisites.map((prereq, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded-md bg-zinc-800 text-zinc-400"
                >
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        </div>
        {project.relatedNodes && project.relatedNodes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <span className="text-xs text-zinc-500 block mb-2">关联路线图节点</span>
            <div className="flex flex-wrap gap-2">
              {project.relatedNodes.map((node, i) => (
                <Link
                  key={i}
                  href={`/roadmap?node=${node}`}
                  className="px-3 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                  {node}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 学习目标 */}
      <section className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <span>🎯</span> 学习目标
        </h2>
        <ul className="space-y-2">
          {project.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="text-emerald-400 mt-0.5">✓</span>
              {obj}
            </li>
          ))}
        </ul>
      </section>

      {/* 项目结构 */}
      <section className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <span>📦</span> 项目结构
        </h2>
        <div className="bg-zinc-800 rounded-lg p-4 font-mono text-sm">
          {project.projectStructure.map((file, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <span className="text-cyan-400">{file.path}</span>
              <span className="text-zinc-500"># {file.description}</span>
              {file.isRequired && (
                <span className="text-xs text-red-400">必需</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 实现步骤 */}
      <section className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
          <span>🚀</span> 实现步骤
        </h2>
        <div className="space-y-0">
          {project.steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              isLast={i === project.steps.length - 1}
            />
          ))}
        </div>
      </section>

      {/* 参考资源 */}
      {project.resources.length > 0 && (
        <section className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <span>📚</span> 参考资源
          </h2>
          <div className="space-y-3">
            {project.resources.map((resource, i) => (
              <ResourceLink key={i} resource={resource} />
            ))}
          </div>
        </section>
      )}

      </div>
  );
}
