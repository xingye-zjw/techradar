'use client';

import { useState } from 'react';
import { ProjectStep, StepContent } from '@/lib/content-types';
import { cn } from '@/lib/utils';

interface StepCardProps {
  step: ProjectStep;
  isLast?: boolean;
}

export function StepCard({ step, isLast = false }: StepCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [showErrors, setShowErrors] = useState(false);

  // 获取步骤内容
  const content: StepContent | undefined = step.content;
  const objective = content?.objective || step.description || '';
  const tasks = content?.tasks || [];
  const checkpoint = content?.checkpoint || step.checkpoint || '';
  const commonErrors = content?.common_errors || step.common_errors || [];

  // 提取代码块（除了 reserved keys 之外的字符串字段）
  const reservedKeys = ['objective', 'tasks', 'checkpoint', 'common_errors'];
  const codeBlocks: { name: string; code: string }[] = [];
  if (content) {
    for (const [key, value] of Object.entries(content)) {
      if (reservedKeys.includes(key)) continue;
      if (typeof value === 'string' && value.startsWith('```')) {
        codeBlocks.push({ name: key, code: value });
      }
    }
  }

  // 渲染代码块名称为标题
  const getCodeBlockTitle = (name: string): string => {
    const titleMap: Record<string, string> = {
      'gpu_verification': 'GPU 验证代码',
      'data_pipeline': '数据加载代码',
      'visualization': '可视化代码',
      'resnet_model': 'ResNet 模型代码',
      'model_usage': '模型使用代码',
      'train_script': '训练脚本',
      'evaluation_script': '评估代码',
      'grad_cam': 'Grad-CAM 代码',
      'tsne_visualization': 't-SNE 可视化',
      'installation_verification': '环境验证代码',
      'tokenization': '分词器代码',
      'full_preprocessing': '完整预处理代码',
      'model_loading': '模型加载代码',
      'model_structure': '模型结构代码',
      'forward_test': '前向传播测试',
      'train_code': '训练代码',
      'evaluation': '评估代码',
      'inference_examples': '推理示例',
      'simple_predict_function': '预测函数',
      'dockerfile': 'Dockerfile',
      'dockerignore': '.dockerignore',
      'docker_commands': 'Docker 命令',
      'gunicorn_config': 'Gunicorn 配置',
      'nginx_config': 'Nginx 配置',
      'prometheus_config': 'Prometheus 配置',
      'alert_rules': '告警规则',
      'numpy_basics': 'NumPy 基础代码',
      'vector_operations': '向量运算代码',
      'matrix_operations': '矩阵运算代码',
      'matrix_properties': '矩阵性质代码',
      'solve_linear_system': '解线性方程组代码',
      'eigen_decomposition': '特征分解代码',
      'geometric_interpretation': '几何解释代码',
      'pca_connection': 'PCA 关联代码',
      'svd_decomposition': 'SVD 分解代码',
      'image_compression': '图像压缩代码',
      'svd_vs_pca': 'SVD vs PCA 代码',
      'pca_from_scratch': 'PCA 实现代码',
      'verify_with_sklearn': 'sklearn 验证代码',
    };
    return titleMap[name] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

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
        {/* 步骤标题和折叠按钮 */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-base font-semibold text-zinc-100">
            {step.title}
          </h4>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            {expanded ? '收起 ▲' : '展开 ▼'}
          </button>
        </div>

        {/* 步骤目标 */}
        {objective && (
          <p className="text-sm text-zinc-400 leading-relaxed mb-3">
            {objective}
          </p>
        )}

        {/* 可折叠内容 */}
        {expanded && (
          <>
            {/* 任务列表 */}
            {tasks.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-zinc-300 mb-2">任务清单</h5>
                <ul className="space-y-1">
                  {tasks.map((task, i) => (
                    <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">▸</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 代码块 */}
            {codeBlocks.map((block, i) => (
              <div key={i} className="mb-4">
                <h5 className="text-sm font-medium text-zinc-300 mb-2">
                  {getCodeBlockTitle(block.name)}
                </h5>
                <div className="bg-zinc-800 rounded-md p-3 overflow-x-auto">
                  <pre className="text-xs text-cyan-400 font-mono whitespace-pre-wrap">
                    {block.code.replace(/```\w*\n?/g, '').replace(/\\n/g, '\n')}
                  </pre>
                </div>
              </div>
            ))}

            {/* 常见错误 */}
            {commonErrors.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <span>⚠️</span>
                  <span>常见错误 ({commonErrors.length})</span>
                  <span className="text-xs">{showErrors ? '▲' : '▼'}</span>
                </button>
                {showErrors && (
                  <div className="mt-2 space-y-2">
                    {commonErrors.map((err, i) => (
                      <div key={i} className="p-3 bg-red-500/5 border border-red-500/20 rounded-md">
                        <p className="text-sm text-red-400 font-medium mb-1">
                          ❌ {err.error}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {err.solution}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 完成标准 */}
            {checkpoint && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-md">
                <p className="text-sm text-emerald-400">
                  <span className="font-medium">✓ 完成标准：</span>
                  {checkpoint}
                </p>
              </div>
            )}

            {/* 旧格式兼容：hint */}
            {step.hint && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-sm text-yellow-400">💡 提示：{step.hint}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
