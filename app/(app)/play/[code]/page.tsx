import { redirect } from 'next/navigation';
import { db } from '@/lib/db/connection';
import { quizSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PlayerView } from '@/components/quiz/PlayerView';
import { PlayPageClient } from './PlayPageClient';
import { convertQuizSession } from '@/lib/types/converters';
import type { DatabaseQuizSession } from '@/lib/types';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

interface PlayPageProps {
  params: Promise<{ code: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
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
    redirect('/join');
  }

  // Get user ID from cookie (set when joining) or use anonymous ID
  const cookieStore = await cookies();
  let playerId = cookieStore.get(`quiz_player_${code}`)?.value;
  
  if (!playerId) {
    playerId = `guest_${randomUUID()}`;
    cookieStore.set(`quiz_player_${code}`, playerId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  // Convert database type to app type
  const typedSession = convertQuizSession(session as DatabaseQuizSession);

  return (
    <div className="min-h-screen colorblock-bg-pattern p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 border-4 border-[#1F2937] bg-[#A78BFA] text-[#1F2937] p-6 colorblock-shadow">
          <h1 className="text-5xl font-black">
            {session.quiz.title}
          </h1>
        </div>
        <PlayPageClient session={typedSession} playerId={playerId} />
      </div>
    </div>
  );
}
