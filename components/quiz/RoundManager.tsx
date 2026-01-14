'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GameModeSelector } from './GameModeSelector';
import { Plus, Trash2, HelpCircle, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Round, GameMode } from '@/lib/types/app';

interface RoundManagerProps {
  rounds: Round[];
  onRoundsChange: (rounds: Round[]) => void;
}

export function RoundManager({ rounds, onRoundsChange }: RoundManagerProps) {
  const [showHelp, setShowHelp] = useState(false);

  const addRound = () => {
    const newRound: Round = {
      gameMode: 'standard',
      order: rounds.length,
      title: `Round ${rounds.length + 1}`,
      description: '',
    };
    onRoundsChange([...rounds, newRound]);
  };

  const updateRound = (index: number, updates: Partial<Round>) => {
    const newRounds = [...rounds];
    newRounds[index] = { ...newRounds[index], ...updates };
    onRoundsChange(newRounds);
  };

  const deleteRound = (index: number) => {
    const newRounds = rounds.filter((_, i) => i !== index).map((r, i) => ({
      ...r,
      order: i,
    }));
    onRoundsChange(newRounds);
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-[#1F2937]">Rounds</h2>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
            aria-label="Show help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <Button variant="secondary" onClick={addRound} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Round
        </Button>
      </div>

      {showHelp && (
        <Card variant="blue" className="p-4 mb-4">
          <p className="text-sm font-bold text-[#1F2937]">
            Rounds can be added if you want your quiz to have multiple formats or game modes. 
            Each round can have its own game mode. If you don't add rounds, your quiz will be a 
            single straightforward quiz with the game mode set above.
          </p>
        </Card>
      )}

      {rounds.length === 0 ? (
        <Card variant="yellow" className="p-6 text-center">
          <p className="text-lg font-bold text-[#1F2937] opacity-90">
            No rounds added. Your quiz will be a single straightforward quiz.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rounds.map((round, index) => (
            <Card
              key={index}
              variant={index % 2 === 0 ? 'blue' : 'green'}
              className="relative"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 pt-2">
                  <GripVertical className="w-5 h-5 text-[#6B7280]" />
                  <span className="text-lg font-black text-[#1F2937]">
                    Round {index + 1}
                  </span>
                </div>

                <div className="flex-1 space-y-4">
                  <Input
                    label="Round Title"
                    value={round.title || ''}
                    onChange={(e) => updateRound(index, { title: e.target.value })}
                    placeholder={`Round ${index + 1}`}
                  />

                  <Input
                    label="Round Description (Optional)"
                    value={round.description || ''}
                    onChange={(e) => updateRound(index, { description: e.target.value })}
                    placeholder="Describe this round..."
                  />

                  <GameModeSelector
                    value={round.gameMode}
                    onChange={(mode) => updateRound(index, { gameMode: mode })}
                    showHelp={false}
                  />
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteRound(index)}
                  className="mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
