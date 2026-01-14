import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'purple' | 'pink' | 'blue' | 'yellow' | 'green' | 'orange' | 'red' | 'cyan';
  shadow?: boolean;
}

export function Card({ children, variant = 'default', shadow = true, className, ...props }: CardProps) {
  const variants = {
    default: 'bg-white border-4 border-[#1F2937]',
    purple: 'bg-[#A78BFA] border-4 border-[#1F2937] text-[#1F2937]',
    pink: 'bg-[#F0A4D0] border-4 border-[#1F2937] text-[#1F2937]',
    blue: 'bg-[#93C5FD] border-4 border-[#1F2937] text-[#1F2937]',
    yellow: 'bg-[#FDE68A] border-4 border-[#1F2937] text-[#1F2937]',
    green: 'bg-[#86EFAC] border-4 border-[#1F2937] text-[#1F2937]',
    orange: 'bg-[#FDBA74] border-4 border-[#1F2937] text-[#1F2937]',
    red: 'bg-[#FCA5A5] border-4 border-[#1F2937] text-[#1F2937]',
    cyan: 'bg-[#67E8F9] border-4 border-[#1F2937] text-[#1F2937]',
  };

  return (
    <div
      className={cn(
        'p-8 transition-all duration-200 rounded-lg',
        variants[variant],
        shadow && 'colorblock-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
