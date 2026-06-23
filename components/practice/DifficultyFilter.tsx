'use client';

import { cn } from '@/lib/utils';

interface DifficultyFilterProps {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}

const filters = [
  { value: null, label: '全部' },
  { value: 1, label: '⭐ 初级' },
  { value: 2, label: '⭐⭐ 中级' },
  { value: 3, label: '⭐⭐⭐ 高级' },
  { value: 4, label: '⭐⭐⭐⭐ 专家' },
  { value: 5, label: '⭐⭐⭐⭐⭐ 挑战' },
];

export function DifficultyFilter({ value, onChange, className }: DifficultyFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {filters.map((filter) => (
        <button
          key={filter.value ?? 'all'}
          onClick={() => onChange(filter.value)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            'border border-transparent',
            value === filter.value
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
