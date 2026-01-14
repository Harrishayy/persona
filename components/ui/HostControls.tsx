import { Play, Pause, SkipForward, Square, Users, Check } from 'lucide-react';
import { Button } from './Button';

interface HostControlsProps {
  onStart: () => void;
  onNext: () => void;
  onEnd: () => void;
  onStartQuestion?: () => void;
  isActive: boolean;
  participantCount: number;
  canGoNext: boolean;
  showFinishQuestion?: boolean;
  showStartQuestion?: boolean;
}

export function HostControls({
  onStart,
  onNext,
  onEnd,
  onStartQuestion,
  isActive,
  participantCount,
  canGoNext,
  showFinishQuestion = false,
  showStartQuestion = false,
}: HostControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-[#A78BFA] border-4 border-[#1F2937] text-[#1F2937] colorblock-shadow min-w-0 max-w-full">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Users className="w-5 h-5" />
        <span className="font-bold whitespace-nowrap">{participantCount} joined</span>
      </div>
      <div className="flex-1 min-w-0 hidden sm:block" />
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap min-w-0">
        {!isActive ? (
          <Button onClick={onStart} variant="success" size="md" className="whitespace-nowrap flex-1 sm:flex-none min-w-0">
            <Play className="w-4 h-4 mr-2 flex-shrink-0" />
            Start Quiz
          </Button>
      ) : (
        <>
          {showStartQuestion && onStartQuestion ? (
            <Button
              onClick={onStartQuestion}
              variant="success"
              size="md"
              className="whitespace-nowrap flex-1 sm:flex-none min-w-0"
            >
              <Play className="w-4 h-4 mr-2 flex-shrink-0" />
              Start Question
            </Button>
          ) : showFinishQuestion ? (
            <Button
              onClick={onNext}
              variant="success"
              size="md"
              className="whitespace-nowrap flex-1 sm:flex-none min-w-0"
            >
              <Check className="w-4 h-4 mr-2 flex-shrink-0" />
              Finish Question
            </Button>
          ) : (
            <Button
              onClick={onNext}
              variant="secondary"
              disabled={!canGoNext}
              size="md"
              className="whitespace-nowrap flex-1 sm:flex-none min-w-0"
            >
              <SkipForward className="w-4 h-4 mr-2 flex-shrink-0" />
              Next Question
            </Button>
          )}
          <Button onClick={onEnd} variant="danger" size="md" className="whitespace-nowrap flex-1 sm:flex-none min-w-0">
            <Square className="w-4 h-4 mr-2 flex-shrink-0" />
            End Quiz
          </Button>
        </>
      )}
      </div>
    </div>
  );
}
