'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  color?: 'purple' | 'pink' | 'blue' | 'yellow' | 'green' | 'orange';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  color = 'purple',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const colorMap = {
    purple: 'bg-[#8B5CF6]',
    pink: 'bg-[#EC4899]',
    blue: 'bg-[#3B82F6]',
    yellow: 'bg-[#FBBF24]',
    green: 'bg-[#10B981]',
    orange: 'bg-[#F97316]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/60" />
      <div
        className={cn(
          'relative z-50 w-full border-4 border-black',
          colorMap[color],
          'text-white animate-in fade-in zoom-in-95 duration-200',
          'colorblock-shadow-lg',
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b-4 border-black">
            {title && (
              <h2 className="text-2xl font-black">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/20 transition-colors border-2 border-black"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
