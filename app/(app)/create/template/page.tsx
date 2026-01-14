import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { TemplateSelector } from '@/components/quiz/TemplateSelector';
import { quizTemplates } from '@/lib/utils/templates';
import { TemplatePageClient } from './TemplatePageClient';

export default async function TemplatePage() {
  const { user } = await withAuth();
  
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen colorblock-bg-pattern p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-[#1F2937] mb-8 text-center">
          Choose a Template
        </h1>
        <TemplatePageClient templates={quizTemplates} />
      </div>
    </div>
  );
}
