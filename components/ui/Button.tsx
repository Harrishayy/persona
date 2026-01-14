'use client';

import { ButtonHTMLAttributes, ReactNode, CSSProperties, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { ColorVariant, getColorHex, getColorHover } from '@/lib/utils/colors';
import { useColorblockRotation } from '@/lib/hooks/useColorblockRotation';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
  color?: ColorVariant;
  /**
   * Enable colorblock rotation effect on hover (default: true)
   */
  enableRotation?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  children,
  color,
  style,
  enableRotation = true,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const rotation = useColorblockRotation({ 
    enabled: enableRotation,
    initialRotation: 0, // Start with no rotation
  });
  
  const baseStyles = 'font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-[#1F2937] colorblock-shadow hover:shadow-lg';
  
  const variantColors: Record<string, { bg: string; hover: string }> = {
    primary: { bg: '#A78BFA', hover: '#8B5CF6' },
    secondary: { bg: '#93C5FD', hover: '#60A5FA' },
    danger: { bg: '#FCA5A5', hover: '#F87171' },
    success: { bg: '#86EFAC', hover: '#4ADE80' },
    warning: { bg: '#FDE68A', hover: '#FCD34D' },
    outline: { bg: 'white', hover: '#1F2937' },
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const isOutline = variant === 'outline';
  const colorConfig = color 
    ? { bg: getColorHex(color), hover: getColorHover(color) }
    : variantColors[variant];

  const buttonStyle: CSSProperties = {
    backgroundColor: isHovered && !isOutline ? colorConfig.hover : colorConfig.bg,
    ...(isOutline && { border: '4px solid #1F2937' }),
    ...(isHovered && isOutline && { backgroundColor: '#1F2937', color: 'white' }),
    ...(rotation.transform && { transform: rotation.transform }),
    ...(rotation.isActive && { boxShadow: 'none' }),
    ...style,
  };

  return (
    <button
      className={cn(
        baseStyles,
        sizes[size],
        'rounded-lg flex items-center justify-center',
        !enableRotation && 'hover:scale-105', // Only use scale if rotation is disabled
        className
      )}
      style={buttonStyle}
      disabled={disabled || isLoading}
      onMouseEnter={(e) => {
        setIsHovered(true);
        rotation.handleMouseEnter();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        rotation.handleMouseLeave();
        onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        rotation.handleMouseDown();
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        rotation.handleMouseUp();
        onMouseUp?.(e);
      }}
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
