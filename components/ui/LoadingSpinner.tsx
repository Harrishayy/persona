import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { ColorVariant, getColorHex, COLOR_DEFINITIONS } from '@/lib/utils/colors';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: ColorVariant;
}

export function LoadingSpinner({ size = 'md', color = 'purple', className, ...props }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorHex = getColorHex(color);
  const colorClass = `border-[${colorHex}]`;

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-transparent border-4',
        sizes[size],
        colorClass,
        className
      )}
      style={{ borderColor: colorHex }}
      {...props}
    />
  );
}
