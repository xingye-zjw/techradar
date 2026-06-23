'use client';

import { cn } from '@/lib/utils';
import { getDifficultyStars, getDifficultyLabel } from '@/lib/practice';

interface DifficultyBadgeProps {
  difficulty: 1 | 2 | 3 | 4 | 5;
  showLabel?: boolean;
  className?: string;
}

const difficultyColors: Record<number, string> = {
  1: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  2: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  3: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  4: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  5: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function DifficultyBadge({ difficulty, showLabel = true, className }: DifficultyBadgeProps) {
  const stars = getDifficultyStars(difficulty);
  const label = getDifficultyLabel(difficulty);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
        difficultyColors[difficulty],
        className
      )}
    >
      <span>{stars}</span>
      {showLabel && <span>{label}</span>}
    </span>
  );
}
