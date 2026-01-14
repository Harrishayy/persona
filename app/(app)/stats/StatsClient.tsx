'use client';

import { Card } from '@/components/ui/Card';
import { ChartColumn, Gamepad2, Users, Target, Trophy, TrendingUp } from 'lucide-react';
import { getUniqueColors, hexColorsToVariants } from '@/lib/utils/colors';

interface Stats {
  totalQuizzes: number;
  totalSessions: number;
  totalParticipants: number;
  publishedQuizzes: number;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
  averageScore: number;
  totalParticipations: number;
}

interface StatsClientProps {
  stats: Stats;
}

export function StatsClient({ stats }: StatsClientProps) {
  const statCards = [
    {
      label: 'Total Quizzes',
      value: stats.totalQuizzes,
      icon: Gamepad2,
      variant: 'purple' as const,
    },
    {
      label: 'Published Quizzes',
      value: stats.publishedQuizzes,
      icon: Target,
      variant: 'green' as const,
    },
    {
      label: 'Total Sessions',
      value: stats.totalSessions,
      icon: ChartColumn,
      variant: 'blue' as const,
    },
    {
      label: 'Total Participants',
      value: stats.totalParticipants,
      icon: Users,
      variant: 'pink' as const,
    },
    {
      label: 'Quiz Participations',
      value: stats.totalParticipations,
      icon: Trophy,
      variant: 'yellow' as const,
    },
    {
      label: 'Average Score',
      value: `${stats.averageScore}`,
      icon: TrendingUp,
      variant: 'orange' as const,
    },
    {
      label: 'Total Answers',
      value: stats.totalAnswers,
      icon: Target,
      variant: 'cyan' as const,
    },
    {
      label: 'Accuracy',
      value: `${stats.accuracy}%`,
      icon: TrendingUp,
      variant: 'mint' as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} variant={stat.variant} className="text-center">
              <Icon className="w-12 h-12 mx-auto mb-4" />
              <div className="text-4xl font-black mb-2">{stat.value}</div>
              <div className="text-lg font-bold opacity-90">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {stats.totalAnswers > 0 && (
        <Card variant="lavender" className="p-8">
          <h2 className="text-3xl font-black mb-6 text-center">Answer Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Correct Answers</span>
              <span className="text-2xl font-black">{stats.correctAnswers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 border-4 border-[#1F2937]">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.accuracy}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Incorrect Answers</span>
              <span className="text-2xl font-black">{stats.totalAnswers - stats.correctAnswers}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
