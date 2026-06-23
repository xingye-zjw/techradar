'use client';

import { useState, useMemo } from 'react';
import { getAllProjects } from '@/lib/practice';
import { ProjectCard } from '@/components/practice/ProjectCard';
import { DifficultyFilter } from '@/components/practice/DifficultyFilter';

// 静态生成所有项目数据
const projects = getAllProjects();

export default function PracticePage() {
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

  const filteredProjects = useMemo(() => {
    if (difficultyFilter === null) return projects;
    return projects.filter(p => p.difficulty === difficultyFilter);
  }, [difficultyFilter]);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            🚀 实战项目
          </h1>
          <p className="text-zinc-400">
            通过实际项目巩固学习成果，建立完整的项目经验
          </p>
        </div>

        {/* 难度筛选 */}
        <div className="mb-8">
          <DifficultyFilter
            value={difficultyFilter}
            onChange={setDifficultyFilter}
          />
        </div>

        {/* 项目统计 */}
        <div className="mb-6 text-sm text-zinc-500">
          共 {filteredProjects.length} 个项目
          {difficultyFilter && (
            <span>（难度 {difficultyFilter} 星）</span>
          )}
        </div>

        {/* 项目列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        {/* 空状态 */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500">暂无符合条件的项目</p>
          </div>
        )}
      </div>
    </main>
  );
}
