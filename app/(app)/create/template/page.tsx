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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
          Choose a Template
        </h1>
        <TemplatePageClient templates={quizTemplates} />
      </div>
    </div>
  );
}
