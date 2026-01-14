'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { getRandomizedColors } from '@/lib/utils/colors';

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  colors?: string[]; // Optional: allow parent to pass colors
}


export function CodeInput({ length = 6, value, onChange, error, className, colors: providedColors }: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  
  const colors = useMemo(() => {
    if (providedColors) return providedColors;
    return getRandomizedColors(length);
  }, [providedColors, length]);

  const handleChange = (index: number, char: string) => {
    const upperChar = char.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (upperChar.length > 1) return;

    const newValue = value.split('');
    newValue[index] = upperChar;
    const newCode = newValue.join('').slice(0, length);
    onChange(newCode);

    if (upperChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length);
    onChange(pasted);
    if (pasted.length < length) {
      inputRefs.current[pasted.length]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }
  };


  return (
    <div className={cn('w-full', className)}>
      <label htmlFor="code-input-0" className="block text-base font-bold text-[#1F2937] mb-3 text-center px-4">
        Quiz Code
      </label>
      <div className="flex gap-1.5 sm:gap-2 justify-center min-w-0 px-1 py-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            id={`code-input-${index}`}
            name={`code-${index}`}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              'w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-18 text-center text-xl sm:text-2xl md:text-3xl font-black border-2 sm:border-3 md:border-4 border-[#1F2937] rounded-lg',
              'bg-white text-[#1F2937] flex-shrink-0',
              'focus:outline-none focus:ring-2 sm:focus:ring-3 md:focus:ring-4 focus:ring-[#A78BFA] focus:ring-offset-1 sm:focus:ring-offset-2',
              'transition-all duration-200 colorblock-shadow',
              'hover:scale-105',
              error && 'border-[#FCA5A5] focus:ring-[#FCA5A5]'
            )}
            style={{
              backgroundColor: value[index] ? colors[index % colors.length] : undefined,
              color: value[index] ? '#1F2937' : undefined,
            }}
          />
        ))}
      </div>
      {error && (
        <p className="mt-4 text-sm font-bold text-[#FCA5A5] text-center">{error}</p>
      )}
    </div>
  );
}
