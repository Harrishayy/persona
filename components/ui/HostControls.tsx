import { Play, Pause, SkipForward, Square, Users } from 'lucide-react';
import { Button } from './Button';

interface HostControlsProps {
  onStart: () => void;
  onNext: () => void;
  onEnd: () => void;
  isActive: boolean;
  participantCount: number;
  canGoNext: boolean;
}

export function HostControls({
  onStart,
  onNext,
  onEnd,
  isActive,
  participantCount,
  canGoNext,
}: HostControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#A78BFA] border-4 border-[#1F2937] text-[#1F2937] colorblock-shadow">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5" />
        <span className="font-bold">{participantCount} joined</span>
      </div>
      <div className="flex-1" />
      {!isActive ? (
        <Button onClick={onStart} variant="success" size="lg">
          <Play className="w-5 h-5 mr-2" />
          Start Quiz
        </Button>
      ) : (
        <>
          <Button
            onClick={onNext}
            variant="secondary"
            disabled={!canGoNext}
            size="lg"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Next Question
          </Button>
          <Button onClick={onEnd} variant="danger" size="lg">
            <Square className="w-5 h-5 mr-2" />
            End Quiz
          </Button>
        </>
      )}
    </div>
  );
}
