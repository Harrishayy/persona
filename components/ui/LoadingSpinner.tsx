import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'pink' | 'blue' | 'green';
}

export function LoadingSpinner({ size = 'md', color = 'purple', className, ...props }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colors = {
    purple: 'border-[#8B5CF6]',
    pink: 'border-[#EC4899]',
    blue: 'border-[#3B82F6]',
    green: 'border-[#10B981]',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-transparent border-4',
        sizes[size],
        colors[color],
        className
      )}
      {...props}
    />
  );
}
