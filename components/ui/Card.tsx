import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'purple' | 'pink' | 'blue' | 'yellow' | 'green' | 'orange';
  shadow?: boolean;
}

export function Card({ children, variant = 'default', shadow = true, className, ...props }: CardProps) {
  const variants = {
    default: 'bg-white border-4 border-black',
    purple: 'bg-[#8B5CF6] border-4 border-black text-white',
    pink: 'bg-[#EC4899] border-4 border-black text-white',
    blue: 'bg-[#3B82F6] border-4 border-black text-white',
    yellow: 'bg-[#FBBF24] border-4 border-black text-black',
    green: 'bg-[#10B981] border-4 border-black text-white',
    orange: 'bg-[#F97316] border-4 border-black text-white',
  };

  return (
    <div
      className={cn(
        'p-6 transition-all duration-200',
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
