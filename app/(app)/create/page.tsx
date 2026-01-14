import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { CreatePageClient } from './CreatePageClient';

export default async function CreatePage() {
  const { user } = await withAuth();
  
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen colorblock-bg-pattern p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <CreatePageClient />
      </div>
    </div>
  );
}
