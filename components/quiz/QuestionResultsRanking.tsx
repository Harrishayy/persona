'use client';

import { Card } from '@/components/ui/Card';
import { Trophy, Medal, Award } from 'lucide-react';
import type { Participant } from '@/lib/types/app';

interface QuestionResultsRankingProps {
  participants: Participant[];
}

export function QuestionResultsRanking({ participants }: QuestionResultsRankingProps) {
  // Sort participants by score (highest first)
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  const getRankIcon = (index: number) => {
    if (index === 0) {
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    }
    if (index === 1) {
      return <Medal className="w-6 h-6 text-gray-400" />;
    }
    if (index === 2) {
      return <Award className="w-6 h-6 text-orange-500" />;
    }
    return (
      <span className="w-6 h-6 flex items-center justify-center font-black text-lg">
        {index + 1}
      </span>
    );
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-yellow-200';
    if (index === 1) return 'bg-gray-200';
    if (index === 2) return 'bg-orange-200';
    return 'bg-white';
  };

  return (
    <Card variant="yellow" className="p-6">
      <h3 className="text-2xl font-black mb-6 text-center">Live Rankings</h3>
      <div className="space-y-3">
        {sortedParticipants.map((participant, index) => (
          <div
            key={participant.userId}
            className={`
              flex items-center justify-between p-4 border-4 border-[#1F2937]
              transition-all duration-200 font-bold
              ${getRankColor(index)}
            `}
          >
            <div className="flex items-center gap-3">
              {getRankIcon(index)}
              <span className="text-lg font-black">
                {participant.userName || `User ${participant.userId.slice(0, 8)}`}
              </span>
            </div>
            <div className="text-xl font-black">
              {participant.score} {participant.score === 1 ? 'point' : 'points'}
            </div>
          </div>
        ))}
        {sortedParticipants.length === 0 && (
          <div className="text-center py-8">
            <p className="text-lg font-bold opacity-75">No participants yet</p>
          </div>
        )}
      </div>
    </Card>
  );
}
