'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface TimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  variant?: 'circular' | 'linear';
  className?: string;
}

export function Timer({ initialSeconds, onComplete, variant = 'circular', className }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onComplete]);

  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  const progress = (seconds / initialSeconds) * 100;

  if (variant === 'linear') {
    const color = seconds <= 10 ? '#EF4444' : seconds <= 30 ? '#FBBF24' : '#10B981';
    
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-black">Time Remaining</span>
          <span 
            className="text-2xl font-black"
            style={{ color }}
          >
            {String(minutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
          </span>
        </div>
        <div className="w-full h-6 bg-white border-4 border-black overflow-hidden">
          <div
            className="h-full transition-all duration-1000"
            style={{ 
              width: `${progress}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    );
  }

  // Circular variant
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const color = seconds <= 10 ? '#EF4444' : seconds <= 30 ? '#FBBF24' : '#10B981';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#000"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="text-xl font-black"
          style={{ color }}
        >
          {String(minutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
