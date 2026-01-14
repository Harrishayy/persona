'use client';

import { Button } from '@/components/ui/Button';
import { LayoutGrid, Eye } from 'lucide-react';

interface ViewModeToggleProps {
  isDetailed: boolean;
  onToggle: (isDetailed: boolean) => void;
}

export function ViewModeToggle({ isDetailed, onToggle }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <Button
        type="button"
        variant={!isDetailed ? 'primary' : 'outline'}
        onClick={() => onToggle(false)}
        size="md"
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        Simple View
      </Button>
      <Button
        type="button"
        variant={isDetailed ? 'primary' : 'outline'}
        onClick={() => onToggle(true)}
        size="md"
      >
        <Eye className="w-4 h-4 mr-2" />
        Detailed Overview
      </Button>
    </div>
  );
}
