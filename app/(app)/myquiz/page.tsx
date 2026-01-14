import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { MyQuizClient } from './MyQuizClient';
import { getQuizzesByHostId } from '@/lib/db/queries/quizzes';

export default async function MyQuizPage() {
  const { user } = await withAuth();
  
  if (!user) {
    redirect('/auth/login');
  }

  const quizzes = await getQuizzesByHostId(user.id);
  const formattedQuizzes = quizzes.map(q => ({
    ...q,
    description: q.description ?? undefined,
  }));

  return (
    <div className="min-h-screen colorblock-bg-pattern p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-[#1F2937] mb-4">
            My Quizzes
          </h1>
          <p className="text-2xl font-bold text-[#1F2937] opacity-80">
            Manage and view all your quizzes
          </p>
        </div>
        <MyQuizClient initialQuizzes={formattedQuizzes} />
      </div>
    </div>
  );
}
