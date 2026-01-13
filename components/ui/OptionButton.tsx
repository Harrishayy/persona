'use client';

import { ButtonHTMLAttributes } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OptionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
  colorIndex?: number;
}

const colorBlocks = [
  { bg: '#8B5CF6', text: 'white' },
  { bg: '#EC4899', text: 'white' },
  { bg: '#3B82F6', text: 'white' },
  { bg: '#10B981', text: 'white' },
  { bg: '#FBBF24', text: 'black' },
  { bg: '#F97316', text: 'white' },
];

export function OptionButton({
  text,
  isSelected = false,
  isCorrect = false,
  showResult = false,
  colorIndex = 0,
  className,
  ...props
}: OptionButtonProps) {
  const color = colorBlocks[colorIndex % colorBlocks.length];
  
  return (
    <button
      className={cn(
        'w-full p-4 border-4 border-black text-left transition-all duration-200',
        'font-bold text-lg',
        'hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
        'active:translate-x-2 active:translate-y-2',
        !isSelected && !showResult && 'colorblock-shadow',
        showResult && isCorrect && 'bg-[#10B981] text-white',
        showResult && isSelected && !isCorrect && 'bg-[#EF4444] text-white',
        className
      )}
      style={{
        backgroundColor: !showResult ? (isSelected ? color.bg : 'white') : undefined,
        color: !showResult ? (isSelected ? color.text : 'black') : undefined,
      }}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <span>{text}</span>
        {showResult && (
          <div>
            {isCorrect ? (
              <Check className="w-6 h-6 text-white" />
            ) : isSelected ? (
              <X className="w-6 h-6 text-white" />
            ) : null}
          </div>
        )}
      </div>
    </button>
  );
}
