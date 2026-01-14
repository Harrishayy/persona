'use client';

import { Button } from '@/components/ui/Button';
import { LayoutGrid, Scroll } from 'lucide-react';

export type QuestionFormat = 'card' | 'scrollable';

interface FormatToggleProps {
  format: QuestionFormat;
  onFormatChange: (format: QuestionFormat) => void;
}

export function FormatToggle({ format, onFormatChange }: FormatToggleProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-base font-bold text-[#1F2937] mr-2">Format:</span>
      <Button
        type="button"
        variant={format === 'card' ? 'primary' : 'outline'}
        onClick={() => onFormatChange('card')}
        size="sm"
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        Card Moving
      </Button>
      <Button
        type="button"
        variant={format === 'scrollable' ? 'primary' : 'outline'}
        onClick={() => onFormatChange('scrollable')}
        size="sm"
      >
        <Scroll className="w-4 h-4 mr-2" />
        Scrollable
      </Button>
    </div>
  );
}
