'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuizCreator } from '@/components/quiz/QuizCreator';
import type { QuizTemplate } from '@/lib/types';
import type { DatabaseQuiz } from '@/lib/types/database';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function CreatePageClient() {
  const searchParams = useSearchParams();
  const [template, setTemplate] = useState<QuizTemplate | null>(null);
  const [quiz, setQuiz] = useState<DatabaseQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const quizId = searchParams.get('quizId');
    
    if (quizId) {
      setIsLoading(true);
      setError(null);
      fetch(`/api/quizzes/${quizId}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to load quiz');
          }
          return res.json();
        })
        .then((data) => {
          setQuiz(data);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load quiz');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (searchParams.get('template') === 'true') {
      const stored = sessionStorage.getItem('selectedTemplate');
      if (stored) {
        setTemplate(JSON.parse(stored));
        sessionStorage.removeItem('selectedTemplate');
      }
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-6 border-4 border-[#1F2937] bg-red-100 rounded-lg">
          <h2 className="text-2xl font-black mb-2">Error</h2>
          <p className="text-lg font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return <QuizCreator initialTemplate={template} initialQuiz={quiz} />;
}
