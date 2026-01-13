'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { cn } from '@/lib/utils/cn';

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function CodeInput({ length = 6, value, onChange, error, className }: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#FBBF24', '#F97316'];

  return (
    <div className={cn('w-full', className)}>
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              'w-14 h-16 text-center text-3xl font-black border-4 border-black',
              'bg-white text-black',
              'focus:outline-none focus:ring-4 focus:ring-[#8B5CF6] focus:ring-offset-2',
              'transition-all duration-200',
              error && 'border-[#EF4444] focus:ring-[#EF4444]'
            )}
            style={{
              backgroundColor: value[index] ? colors[index % colors.length] : undefined,
              color: value[index] ? 'white' : undefined,
            }}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-sm font-bold text-[#EF4444] text-center">{error}</p>
      )}
    </div>
  );
}
