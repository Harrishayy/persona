'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { getDeterministicColors, getRandomizedColors } from '@/lib/utils/colors';

interface ColorblockTitleProps {
  text?: string;
  className?: string;
}

const DEFAULT_TEXT = 'PERSONA';

// Different rotation angles for visual interest
const rotations = [
  -3,   // P
  2,    // E
  -1,   // R
  1.5,  // S
  -2,   // O
  2.5,  // N
  -1.5, // A
];

export function ColorblockTitle({ text = DEFAULT_TEXT, className }: ColorblockTitleProps) {
  const [mounted, setMounted] = useState(false);
  const letters = text.split('');
  
  const colors = useMemo(() => {
    if (mounted) {
      return getRandomizedColors(letters.length);
    }
    return getDeterministicColors(text, letters.length);
  }, [mounted, text, letters.length]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn('flex items-center justify-center gap-1.5 sm:gap-2', className)}>
      {letters.map((letter, index) => {
        const rotation = rotations[index % rotations.length];
        const color = colors[index % colors.length];
        
        return (
          <div
            key={index}
            className={cn(
              'inline-flex items-center justify-center',
              'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
              'border-4 border-[#1F2937]',
              'text-[#1F2937]',
              'font-black text-2xl sm:text-3xl md:text-4xl',
              'colorblock-shadow',
              'transition-all duration-300 ease-in-out hover:scale-110'
            )}
            style={{
              backgroundColor: color,
              transform: `rotate(${rotation}deg)`,
            }}
            onClick={() => {
              
            }}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
}