'use client';

import { useEffect, useRef, useState } from 'react';
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
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
    if (closeRef.current) {
      clearTimeout(closeRef.current);
      closeRef.current = null;
    }
  };

  useEffect(() => {
    clearTimers();
    autoCloseRef.current = setTimeout(() => {
      setIsVisible(false);
      closeRef.current = setTimeout(onClose, 300);
    }, duration);

    return clearTimers;
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-[#86EFAC] text-[#1F2937] border-4 border-[#1F2937]',
    error: 'bg-[#FCA5A5] text-[#1F2937] border-4 border-[#1F2937]',
    info: 'bg-[#93C5FD] text-[#1F2937] border-4 border-[#1F2937]',
    warning: 'bg-[#FDE68A] text-[#1F2937] border-4 border-[#1F2937]',
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
          clearTimers();
          setIsVisible(false);
          closeRef.current = setTimeout(onClose, 300);
        }}
        className="p-1 hover:bg-[#1F2937]/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
