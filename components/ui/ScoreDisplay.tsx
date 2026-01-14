import { Trophy, Star } from 'lucide-react';
import { Card } from './Card';
import { cn } from '@/lib/utils/cn';

interface ScoreDisplayProps {
  score: number;
  total?: number;
  label?: string;
  variant?: 'default' | 'large';
}

export function ScoreDisplay({ score, total, label, variant = 'default' }: ScoreDisplayProps) {
  const percentage = total ? Math.round((score / total) * 100) : 0;

  if (variant === 'large') {
    return (
      <Card variant="yellow" className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-16 h-16 text-[#1F2937]" />
        </div>
        <div className="text-6xl font-black text-[#1F2937] mb-2">
          {score}
          {total && <span className="text-4xl opacity-70">/{total}</span>}
        </div>
        {label && (
          <p className="text-xl font-bold text-[#1F2937] opacity-90">{label}</p>
        )}
        {total && (
          <div className="mt-4">
            <div className="text-3xl font-black text-[#1F2937]">
              {percentage}%
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Star className="w-5 h-5 text-[#FDE68A]" />
      <span className="font-black text-[#1F2937] text-lg">
        {score}
        {total && <span className="opacity-70">/{total}</span>}
      </span>
    </div>
  );
}
