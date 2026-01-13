import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ children, variant = 'default', size = 'md', className, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-black text-white border-2 border-black',
    success: 'bg-[#10B981] text-white border-2 border-black',
    warning: 'bg-[#FBBF24] text-black border-2 border-black',
    error: 'bg-[#EF4444] text-white border-2 border-black',
    info: 'bg-[#3B82F6] text-white border-2 border-black',
    purple: 'bg-[#8B5CF6] text-white border-2 border-black',
    pink: 'bg-[#EC4899] text-white border-2 border-black',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
