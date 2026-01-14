import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { getColorHex } from '@/lib/utils/colors';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ children, variant = 'default', size = 'md', className, style, ...props }: BadgeProps) {
  const baseStyles = 'text-[#1F2937] border-2 border-[#1F2937]';
  
  const variants: Record<string, { className: string; style?: React.CSSProperties }> = {
    default: { className: 'bg-[#1F2937] text-white border-[#1F2937]' },
    success: { className: `bg-[${getColorHex('green')}] ${baseStyles}` },
    warning: { className: `bg-[${getColorHex('yellow')}] ${baseStyles}` },
    error: { className: `bg-[${getColorHex('red')}] ${baseStyles}` },
    info: { className: `bg-[${getColorHex('blue')}] ${baseStyles}` },
    purple: { className: baseStyles, style: { backgroundColor: getColorHex('purple') } },
    pink: { className: baseStyles, style: { backgroundColor: getColorHex('pink') } },
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold',
        variantStyles.className,
        sizes[size],
        className
      )}
      style={{ ...variantStyles.style, ...style }}
      {...props}
    >
      {children}
    </span>
  );
}
