import { Trophy, Users } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';

interface Participant {
  id: number;
  userId: string;
  userName?: string;
  score: number;
}

interface ParticipantListProps {
  participants: Participant[];
  currentUserId?: string;
}

export function ParticipantList({ participants, currentUserId }: ParticipantListProps) {
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  return (
    <Card variant="blue">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5" />
        <h3 className="text-lg font-black">
          Participants ({participants.length})
        </h3>
      </div>
      <div className="space-y-2">
        {sortedParticipants.map((participant, index) => (
          <div
            key={participant.id}
            className={`
              flex items-center justify-between p-3 border-4 border-[#1F2937]
              transition-all duration-200 font-bold
              ${currentUserId === participant.userId
                ? 'bg-[#FDE68A] text-[#1F2937]'
                : 'bg-white text-[#1F2937]'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {index === 0 && participants.length > 1 && (
                <Trophy className="w-5 h-5 text-[#FDE68A]" />
              )}
              <span>
                {participant.userName || `User ${participant.userId.slice(0, 8)}`}
              </span>
              {currentUserId === participant.userId && (
                <Badge variant="warning" size="sm">You</Badge>
              )}
            </div>
            <Badge variant={index === 0 ? 'success' : 'default'} size="sm">
              {participant.score} pts
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
