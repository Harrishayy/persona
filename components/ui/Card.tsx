import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { ColorVariant, getColorHex, COLOR_DEFINITIONS } from '@/lib/utils/colors';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | ColorVariant;
  shadow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', shadow = true, className, style, ...props }, ref) => {
    const baseClasses = 'p-8 transition-all duration-200 rounded-lg border-4 border-[#1F2937] text-[#1F2937]';
    
    const isDefault = variant === 'default';
    const backgroundColor = isDefault ? undefined : getColorHex(variant as ColorVariant);
    const bgClass = isDefault ? 'bg-white' : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          bgClass,
          shadow && 'colorblock-shadow',
          className
        )}
        style={{ backgroundColor, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
