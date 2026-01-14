import { redirect } from 'next/navigation';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { HostDashboard } from '@/components/quiz/HostDashboard';
import { HostPageClient } from './HostPageClient';
import { convertQuizSession } from '@/lib/types/converters';
import type { QuizSession } from '@/lib/types';

interface HostPageProps {
  params: Promise<{ code: string }>;
}

export default async function HostPage({ params }: HostPageProps) {
  const { user } = await withAuth();
  if (!user) {
    redirect('/auth/login');
  }

  const { code } = await params;

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
    with: {
      quiz: {
        with: {
          questions: {
            with: {
              options: true,
            },
            orderBy: (questions, { asc }) => [asc(questions.order)],
          },
        },
      },
      participants: true,
    },
  });

  if (!session) {
    redirect('/');
  }

  if (session.quiz.hostId !== user.id) {
    redirect('/');
  }

  const typedSession: QuizSession = convertQuizSession(session as any);

  return (
    <div className="min-h-screen colorblock-bg-pattern p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 border-4 border-[#1F2937] bg-[#F0A4D0] text-[#1F2937] p-8 colorblock-shadow">
          <h1 className="text-5xl font-black mb-3">
            {session.quiz.title}
          </h1>
          <p className="text-xl font-bold opacity-90">
            Host Dashboard • Code: <span className="font-black text-2xl">{code}</span>
          </p>
        </div>
        <HostPageClient session={typedSession} />
      </div>
    </div>
  );
}
