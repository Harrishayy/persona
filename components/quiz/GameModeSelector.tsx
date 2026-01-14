'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GAME_MODES, type GameMode } from '@/lib/utils/game-modes';
import { getColorHex } from '@/lib/utils/colors';
import { Gamepad2, Laugh, Palette, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GameModeSelectorProps {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  showHelp?: boolean;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gamepad2,
  Laugh,
  Lies: HelpCircle, // Placeholder - replace with actual icon when available
  Palette,
  Settings,
};

export function GameModeSelector({ value, onChange, showHelp = false, className }: GameModeSelectorProps) {
  const [showHelpText, setShowHelpText] = useState(false);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <label className="text-base font-bold text-[#1F2937]">
          Game Mode
        </label>
        {showHelp && (
          <button
            type="button"
            onClick={() => setShowHelpText(!showHelpText)}
            className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
            aria-label="Show help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {showHelpText && (
        <Card variant="blue" className="p-4 mb-4">
          <p className="text-sm font-bold text-[#1F2937]">
            Game modes determine how your quiz is played. Standard is traditional multiple choice. 
            Other modes like Quiplash and Fibbage offer unique gameplay experiences.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.values(GAME_MODES).map((mode) => {
          const Icon = iconMap[mode.icon] || Gamepad2;
          const isSelected = value === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={cn(
                'p-4 border-4 border-[#1F2937] rounded-lg transition-all duration-200 text-left',
                'hover:scale-105 active:translate-x-1 active:translate-y-1',
                isSelected ? 'colorblock-shadow' : 'bg-white'
              )}
              style={{
                backgroundColor: isSelected ? getColorHex(mode.color as any) : undefined,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-6 h-6 text-[#1F2937]" />
                <span className="font-black text-[#1F2937]">{mode.name}</span>
              </div>
              <p className="text-xs font-bold text-[#1F2937] opacity-80">
                {mode.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
