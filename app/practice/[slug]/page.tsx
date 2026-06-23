import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProjects, getProjectBySlug } from '@/lib/practice';
import { ProjectDetail } from '@/components/practice/ProjectDetail';

interface PageProps {
  params: {
    slug: string;
  };
}

// 静态生成所有项目页面
export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// 生成页面元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: '项目未找到 - TechRadar',
    };
  }

  return {
    title: `${project.title} - 实战项目 - TechRadar`,
    description: project.summary,
  };
}

export default function ProjectPage({ params }: PageProps) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <ProjectDetail project={project} />
      </div>
    </main>
  );
}
