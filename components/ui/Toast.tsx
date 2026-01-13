'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-[#10B981] text-white border-4 border-black',
    error: 'bg-[#EF4444] text-white border-4 border-black',
    info: 'bg-[#3B82F6] text-white border-4 border-black',
    warning: 'bg-[#FBBF24] text-black border-4 border-black',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 colorblock-shadow',
        'transition-all duration-300 font-bold',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        styles[type]
      )}
    >
      {icons[type]}
      <p className="flex-1">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="p-1 hover:bg-black/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
