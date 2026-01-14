'use client';

import { useState } from 'react';
import { Trophy, Users, X } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '@/lib/utils/cn';

interface Participant {
  id: string | number;
  userId: string;
  userName?: string;
  score: number;
}

interface ParticipantListProps {
  participants: Participant[];
  currentUserId?: string;
  onKick?: (userId: string) => void;
  isHost?: boolean;
}

export function ParticipantList({ 
  participants, 
  currentUserId, 
  onKick,
  isHost = false 
}: ParticipantListProps) {
  const [hoveredParticipantId, setHoveredParticipantId] = useState<string | number | null>(null);
  const [kickConfirmUserId, setKickConfirmUserId] = useState<string | null>(null);
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  const participantToKick = kickConfirmUserId 
    ? sortedParticipants.find(p => p.userId === kickConfirmUserId)
    : null;

  const handleKickClick = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setKickConfirmUserId(userId);
  };

  const handleConfirmKick = () => {
    if (onKick && kickConfirmUserId) {
      onKick(kickConfirmUserId);
      setKickConfirmUserId(null);
    }
  };

  const handleCancelKick = () => {
    setKickConfirmUserId(null);
  };

  return (
    <Card variant="blue">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5" />
        <h3 className="text-lg font-black">
          Participants ({participants.length})
        </h3>
      </div>
      <div className="space-y-2">
        {sortedParticipants.map((participant, index) => {
          const isHovered = hoveredParticipantId === participant.id;
          const canKick = isHost && onKick && currentUserId !== participant.userId;
          // Ensure unique key - use id if available, otherwise fallback to userId + index
          const uniqueKey = participant.id || `${participant.userId}-${index}`;

          return (
            <div
              key={uniqueKey}
              onMouseEnter={() => setHoveredParticipantId(participant.id)}
              onMouseLeave={() => setHoveredParticipantId(null)}
              className={cn(
                'flex items-center justify-between p-3 border-4 border-[#1F2937]',
                'transition-all duration-200 font-bold relative group',
                currentUserId === participant.userId
                  ? 'bg-[#FDE68A] text-[#1F2937]'
                  : 'bg-white text-[#1F2937]'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {index === 0 && participants.length > 1 && (
                  <Trophy className="w-5 h-5 text-[#FDE68A] flex-shrink-0" />
                )}
                <span className="truncate">
                  {participant.userName || `User ${participant.userId.slice(0, 8)}`}
                </span>
                {currentUserId === participant.userId && (
                  <Badge variant="warning" size="sm">You</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={index === 0 ? 'success' : 'default'} size="sm">
                  {participant.score} pts
                </Badge>
                {canKick && (
                  <button
                    onClick={(e) => handleKickClick(participant.userId, e)}
                    className={cn(
                      'p-1.5 rounded transition-all duration-200',
                      'hover:bg-red-500 hover:text-white',
                      'text-red-500 border-2 border-red-500',
                      isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                    title="Kick player"
                    aria-label={`Kick ${participant.userName || participant.userId}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!kickConfirmUserId}
        onClose={handleCancelKick}
        title="Kick Player"
        size="sm"
        color="red"
      >
        <div className="space-y-4">
          <p className="text-lg font-bold">
            Are you sure you want to kick{' '}
            <span className="font-black">
              {participantToKick?.userName || `User ${participantToKick?.userId.slice(0, 8)}`}
            </span>
            ?
          </p>
          <p className="text-sm opacity-75">
            This action cannot be undone. The player will be removed from the session.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={handleCancelKick}
              size="md"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmKick}
              size="md"
            >
              Kick Player
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
