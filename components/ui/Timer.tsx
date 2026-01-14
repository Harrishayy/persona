'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface TimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  variant?: 'circular' | 'linear';
  className?: string;
}

export function Timer({ initialSeconds, onComplete, variant = 'circular', className }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset hasCompletedRef when initialSeconds changes
  useEffect(() => {
    hasCompletedRef.current = false;
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      // Defer the callback to avoid state updates during render
      setTimeout(() => {
        onCompleteRef.current?.();
      }, 0);
      return;
    }

    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Defer the callback to avoid state updates during render
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            setTimeout(() => {
              onCompleteRef.current?.();
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  const progress = (seconds / initialSeconds) * 100;

  if (variant === 'linear') {
    const color = seconds <= 10 ? '#FCA5A5' : seconds <= 30 ? '#FDE68A' : '#86EFAC';
    
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#1F2937]">Time Remaining</span>
          <span 
            className="text-2xl font-black"
            style={{ color }}
          >
            {String(minutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
          </span>
        </div>
        <div className="w-full h-6 bg-white border-4 border-[#1F2937] overflow-hidden">
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
  const color = seconds <= 10 ? '#FCA5A5' : seconds <= 30 ? '#FDE68A' : '#86EFAC';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#1F2937"
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
