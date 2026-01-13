import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-1 active:translate-y-1 active:shadow-none';
  
  const variants = {
    primary: 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] colorblock-shadow hover:shadow-lg',
    secondary: 'bg-[#3B82F6] text-white hover:bg-[#2563EB] colorblock-shadow hover:shadow-lg',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] colorblock-shadow hover:shadow-lg',
    success: 'bg-[#10B981] text-white hover:bg-[#059669] colorblock-shadow hover:shadow-lg',
    warning: 'bg-[#FBBF24] text-black hover:bg-[#F59E0B] colorblock-shadow hover:shadow-lg',
    outline: 'bg-white border-4 border-black text-black hover:bg-black hover:text-white colorblock-shadow',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
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
