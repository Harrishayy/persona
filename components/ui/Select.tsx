'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ label, error, options, onChange, className, value, placeholder, disabled, name, id }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');
    const containerRef = useRef<HTMLDivElement>(null);

    // Combine refs
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(containerRef.current);
        } else {
          ref.current = containerRef.current;
        }
      }
    }, [ref]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Update selected value when value prop changes
    useEffect(() => {
      setSelectedValue(value || '');
    }, [value]);

    const selectedOption = options.find(opt => opt.value === selectedValue);

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      setIsOpen(false);
      onChange?.(optionValue);
    };

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label className="block text-base font-bold text-[#1F2937] mb-3">
            {label}
          </label>
        )}
        <div className="relative">
          {/* Custom select button */}
          {/* Hidden input for form submission */}
          {name && (
            <input
              type="hidden"
              name={name}
              value={selectedValue}
              id={id}
            />
          )}

          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full px-5 py-4 border-4 border-[#1F2937] rounded-lg',
              'bg-white text-[#1F2937] text-lg font-medium',
              'focus:outline-none focus:ring-4 focus:ring-[#A78BFA] focus:ring-offset-2',
              'transition-all duration-200',
              'flex items-center justify-between',
              error && 'border-[#FCA5A5] focus:ring-[#FCA5A5]',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          >
            <span className={selectedValue ? 'text-[#1F2937]' : 'text-[#6B7280] opacity-60'}>
              {selectedOption?.label || placeholder || 'Select an option...'}
            </span>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 flex-shrink-0" />
            )}
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 border-4 border-[#1F2937] rounded-lg bg-white colorblock-shadow max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full px-5 py-3 text-left text-lg font-medium transition-colors',
                    'hover:bg-[#F3F4F6]',
                    selectedValue === option.value && 'bg-[#A78BFA] text-white hover:bg-[#8B5CF6]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-3 text-sm font-bold text-[#FCA5A5]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
