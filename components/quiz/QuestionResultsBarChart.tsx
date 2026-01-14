'use client';

import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/ui/BarChart';
import { getEmojiForOption } from '@/lib/utils/emoji-assignment';
import type { Question } from '@/lib/types/app';

interface QuestionResultsBarChartProps {
  question: Question;
  answerDistribution: Record<string, number>; // optionId -> count
  totalAnswers: number;
}

export function QuestionResultsBarChart({
  question,
  answerDistribution,
  totalAnswers,
}: QuestionResultsBarChartProps) {
  if (!question.options || question.options.length === 0) {
    return (
      <Card variant="orange" className="text-center py-8">
        <p className="text-xl font-bold">No answer options available</p>
      </Card>
    );
  }

  const chartData = question.options.map((option, index) => ({
    optionText: option.text,
    count: answerDistribution[option.id || ''] || 0,
    isCorrect: option.isCorrect,
    emoji: getEmojiForOption(index),
  }));

  return (
    <Card variant="purple" className="p-6">
      <h3 className="text-2xl font-black mb-6 text-center">Answer Distribution</h3>
      <BarChart data={chartData} totalResponses={totalAnswers} />
    </Card>
  );
}
