import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-base font-bold text-[#1F2937] mb-3">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-5 py-4 border-4 border-[#1F2937] rounded-lg',
            'bg-white text-[#1F2937] text-lg font-medium',
            'focus:outline-none focus:ring-4 focus:ring-[#A78BFA] focus:ring-offset-2',
            'transition-all duration-200',
            'placeholder:text-[#6B7280] placeholder:opacity-60',
            error && 'border-[#FCA5A5] focus:ring-[#FCA5A5]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-3 text-sm font-bold text-[#FCA5A5]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
