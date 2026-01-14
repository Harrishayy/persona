import { ReactNode } from 'react';
import { Card } from './Card';
import { ALL_VARIANTS, ColorVariant } from '@/lib/utils/colors';

interface QuestionCardProps {
  questionNumber?: number;
  totalQuestions?: number;
  question: string;
  imageUrl?: string;
  children?: ReactNode;
  colorIndex?: number;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  imageUrl,
  children,
  colorIndex = 0,
}: QuestionCardProps) {
  const variant = (ALL_VARIANTS[colorIndex % ALL_VARIANTS.length] || 'purple') as ColorVariant;
  
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
        <div className="mb-4 flex items-center justify-center">
          <div className="inline-block border-4 border-[#1F2937] rounded-lg bg-white p-2">
            <img
              src={imageUrl}
              alt="Question"
              className="h-auto max-h-96 max-w-full object-contain"
              style={{ display: 'block' }}
              onError={(e) => {
                // Hide image on error (blob URLs may be invalid)
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </Card>
  );
}
