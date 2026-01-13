import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { CreatePageClient } from './CreatePageClient';

export default async function CreatePage() {
  const { user } = await withAuth();
  
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 py-8">
      <CreatePageClient />
    </div>
  );
}
