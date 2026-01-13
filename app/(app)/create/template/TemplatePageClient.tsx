'use client';

import { useRouter } from 'next/navigation';
import { TemplateSelector } from '@/components/quiz/TemplateSelector';
import type { QuizTemplate } from '@/lib/types';

interface TemplatePageClientProps {
  templates: QuizTemplate[];
}

export function TemplatePageClient({ templates }: TemplatePageClientProps) {
  const router = useRouter();

  const handleSelect = (template: QuizTemplate) => {
    // Store template in sessionStorage and redirect to create page
    sessionStorage.setItem('selectedTemplate', JSON.stringify(template));
    router.push('/create?template=true');
  };

  return <TemplateSelector templates={templates} onSelect={handleSelect} />;
}
