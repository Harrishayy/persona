'use client';

import { ButtonHTMLAttributes } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useColorblockRotation } from '@/lib/hooks/useColorblockRotation';

interface OptionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
  colorIndex?: number;
}

const colorBlocks = [
  { bg: '#A78BFA', text: '#1F2937' },
  { bg: '#F0A4D0', text: '#1F2937' },
  { bg: '#93C5FD', text: '#1F2937' },
  { bg: '#86EFAC', text: '#1F2937' },
  { bg: '#FDE68A', text: '#1F2937' },
  { bg: '#FDBA74', text: '#1F2937' },
];

export function OptionButton({
  text,
  isSelected = false,
  isCorrect = false,
  showResult = false,
  colorIndex = 0,
  className,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...props
}: OptionButtonProps) {
  const color = colorBlocks[colorIndex % colorBlocks.length];
  const rotation = useColorblockRotation({ 
    enabled: true,
    initialRotation: 0, // Start with no rotation
  });
  
  return (
    <button
      className={cn(
        'w-full p-4 border-4 border-[#1F2937] text-left transition-all duration-200',
        'font-bold text-lg',
        !isSelected && !showResult && 'colorblock-shadow',
        showResult && isCorrect && 'bg-[#86EFAC] text-[#1F2937]',
        showResult && isSelected && !isCorrect && 'bg-[#FCA5A5] text-[#1F2937]',
        className
      )}
      style={{
        backgroundColor: !showResult ? (isSelected ? color.bg : 'white') : undefined,
        color: !showResult ? (isSelected ? color.text : '#1F2937') : undefined,
        transform: rotation.transform,
        boxShadow: rotation.isActive ? 'none' : undefined,
      }}
      onMouseEnter={(e) => {
        rotation.handleMouseEnter();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        rotation.handleMouseLeave();
        onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        rotation.handleMouseDown();
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        rotation.handleMouseUp();
        onMouseUp?.(e);
      }}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <span>{text}</span>
        {showResult && (
          <div>
            {isCorrect ? (
              <Check className="w-6 h-6 text-[#1F2937]" />
            ) : isSelected ? (
              <X className="w-6 h-6 text-[#1F2937]" />
            ) : null}
          </div>
        )}
      </div>
    </button>
  );
}
