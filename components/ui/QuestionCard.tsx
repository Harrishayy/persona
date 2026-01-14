import { ReactNode } from 'react';
import { Card } from './Card';

interface QuestionCardProps {
  questionNumber?: number;
  totalQuestions?: number;
  question: string;
  imageUrl?: string;
  children?: ReactNode;
  colorIndex?: number;
}

const colorVariants = ['purple', 'pink', 'blue', 'green', 'yellow', 'orange'] as const;

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  imageUrl,
  children,
  colorIndex = 0,
}: QuestionCardProps) {
  const variant = colorVariants[colorIndex % colorVariants.length] || 'purple';
  
  return (
    <Card variant={variant} className="w-full">
      {(questionNumber !== undefined || totalQuestions !== undefined) && (
        <div className="mb-4 text-sm font-black opacity-90">
          Question {questionNumber !== undefined ? `${questionNumber}${totalQuestions !== undefined ? ` of ${totalQuestions}` : ''}` : ''}
        </div>
      )}
      <h2 className="text-3xl font-black mb-4">
        {question}
      </h2>
      {imageUrl && (
        <div className="mb-4 border-4 border-[#1F2937] overflow-hidden">
          <img
            src={imageUrl}
            alt="Question"
            className="w-full h-auto max-h-64 object-cover"
          />
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </Card>
  );
}
