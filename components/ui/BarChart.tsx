'use client';

import { cn } from '@/lib/utils/cn';

interface BarChartData {
  optionText: string;
  count: number;
  isCorrect: boolean;
  emoji: string;
}

interface BarChartProps {
  data: BarChartData[];
  totalResponses: number;
  className?: string;
}

export function BarChart({ data, totalResponses, className }: BarChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid division by zero

  return (
    <div className={cn('space-y-4', className)}>
      {data.map((item, index) => {
        const percentage = totalResponses > 0 ? Math.round((item.count / totalResponses) * 100) : 0;
        const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-bold text-lg">{item.optionText}</span>
                {item.isCorrect && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                    Correct
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl">{item.count}</span>
                <span className="text-sm font-bold opacity-75">
                  ({percentage}%)
                </span>
              </div>
            </div>
            <div className="w-full h-8 bg-white border-4 border-[#1F2937] overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  item.isCorrect ? 'bg-green-500' : 'bg-[#93C5FD]'
                )}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
