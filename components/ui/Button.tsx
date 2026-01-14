import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
  color?: 'purple' | 'pink' | 'blue' | 'yellow' | 'green' | 'orange' | 'red' | 'cyan';
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  children,
  color,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-1 active:translate-y-1 active:shadow-none hover:scale-105';
  
  const variants = {
    primary: 'bg-[#A78BFA] text-[#1F2937] hover:bg-[#8B5CF6] colorblock-shadow hover:shadow-lg',
    secondary: 'bg-[#93C5FD] text-[#1F2937] hover:bg-[#60A5FA] colorblock-shadow hover:shadow-lg',
    danger: 'bg-[#FCA5A5] text-[#1F2937] hover:bg-[#F87171] colorblock-shadow hover:shadow-lg',
    success: 'bg-[#86EFAC] text-[#1F2937] hover:bg-[#4ADE80] colorblock-shadow hover:shadow-lg',
    warning: 'bg-[#FDE68A] text-[#1F2937] hover:bg-[#FCD34D] colorblock-shadow hover:shadow-lg',
    outline: 'bg-white border-4 border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white colorblock-shadow',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const colors = {
    purple: 'bg-[#A78BFA] text-[#1F2937] hover:bg-[#8B5CF6] colorblock-shadow hover:shadow-lg',
    pink: 'bg-[#F0A4D0] text-[#1F2937] hover:bg-[#F0A4D0] colorblock-shadow hover:shadow-lg',
    blue: 'bg-[#93C5FD] text-[#1F2937] hover:bg-[#60A5FA] colorblock-shadow hover:shadow-lg',
    yellow: 'bg-[#FDE68A] text-[#1F2937] hover:bg-[#FCD34D] colorblock-shadow hover:shadow-lg',
    green: 'bg-[#86EFAC] text-[#1F2937] hover:bg-[#4ADE80] colorblock-shadow hover:shadow-lg',
    orange: 'bg-[#FDBA74] text-[#1F2937] hover:bg-[#FDBA74] colorblock-shadow hover:shadow-lg',
    red: 'bg-[#FCA5A5] text-[#1F2937] hover:bg-[#F87171] colorblock-shadow hover:shadow-lg',
    cyan: 'bg-[#67E8F9] text-[#1F2937] hover:bg-[#67E8F9] colorblock-shadow hover:shadow-lg',
  };
  

  return (
    <button
      className={cn(
        baseStyles,
        color ? colors[color] : variants[variant],
        sizes[size],
        'rounded-lg flex items-center justify-center',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
