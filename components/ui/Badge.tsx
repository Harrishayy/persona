import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ children, variant = 'default', size = 'md', className, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#1F2937] text-white border-2 border-[#1F2937]',
    success: 'bg-[#86EFAC] text-[#1F2937] border-2 border-[#1F2937]',
    warning: 'bg-[#FDE68A] text-[#1F2937] border-2 border-[#1F2937]',
    error: 'bg-[#FCA5A5] text-[#1F2937] border-2 border-[#1F2937]',
    info: 'bg-[#93C5FD] text-[#1F2937] border-2 border-[#1F2937]',
    purple: 'bg-[#A78BFA] text-[#1F2937] border-2 border-[#1F2937]',
    pink: 'bg-[#F0A4D0] text-[#1F2937] border-2 border-[#1F2937]',
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
