'use client';

import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { useColorblockRotation } from '@/lib/hooks/useColorblockRotation';

interface EmojiOptionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  emoji: string;
  isSelected?: boolean;
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

export function EmojiOptionButton({
  emoji,
  isSelected = false,
  colorIndex = 0,
  className,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...props
}: EmojiOptionButtonProps) {
  const color = colorBlocks[colorIndex % colorBlocks.length];
  const rotation = useColorblockRotation({ 
    enabled: true,
    initialRotation: 0,
  });
  
  return (
    <button
      className={cn(
        'w-full p-6 border-4 border-[#1F2937] text-center transition-all duration-200',
        'font-bold text-4xl md:text-5xl',
        !isSelected && 'colorblock-shadow',
        className
      )}
      style={{
        backgroundColor: isSelected ? color.bg : 'white',
        color: isSelected ? color.text : '#1F2937',
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
      <span className="text-5xl md:text-6xl">{emoji}</span>
    </button>
  );
}
