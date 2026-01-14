import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { FindQuizClient } from './FindQuizClient';

export default async function FindQuizPage() {
  const { user } = await withAuth();
  
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen colorblock-bg-pattern p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-[#1F2937] mb-4">
            Find a Quiz
          </h1>
          <p className="text-2xl font-bold text-[#1F2937] opacity-80">
            Discover and host public quizzes
          </p>
        </div>
        <FindQuizClient />
      </div>
    </div>
  );
}
