'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuizCreator } from '@/components/quiz/QuizCreator';
import type { QuizTemplate } from '@/lib/types';

export function CreatePageClient() {
  const searchParams = useSearchParams();
  const [template, setTemplate] = useState<QuizTemplate | null>(null);

  useEffect(() => {
    if (searchParams.get('template') === 'true') {
      const stored = sessionStorage.getItem('selectedTemplate');
      if (stored) {
        setTemplate(JSON.parse(stored));
        sessionStorage.removeItem('selectedTemplate');
      }
    }
  }, [searchParams]);

  return <QuizCreator initialTemplate={template} />;
}
