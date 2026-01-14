import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { StatsClient } from './StatsClient';
import { getQuizStats } from '@/lib/db/queries/quizzes';
import { db } from '@/lib/db/connection';
import { answers, participants, quizzes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function StatsPage() {
  const { user } = await withAuth();
  
  if (!user) {
    redirect('/auth/login');
  }

  const quizStats = await getQuizStats(user.id);

  // Get user's quizzes to find their sessions
  const userQuizzes = await db.query.quizzes.findMany({
    where: eq(quizzes.hostId, user.id),
    with: {
      sessions: {
        with: {
          answers: true,
          participants: true,
        },
      },
    },
  });

  // Calculate stats from all sessions
  let totalAnswers = 0;
  let correctAnswers = 0;
  let totalParticipations = 0;
  let totalScores = 0;

  userQuizzes.forEach(quiz => {
    quiz.sessions.forEach(session => {
      totalAnswers += session.answers.length;
      correctAnswers += session.answers.filter(a => a.isCorrect).length;
      totalParticipations += session.participants.filter(p => p.userId === user.id).length;
      const userParticipant = session.participants.find(p => p.userId === user.id);
      if (userParticipant) {
        totalScores += userParticipant.score;
      }
    });
  });

  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  const averageScore = totalParticipations > 0 ? Math.round(totalScores / totalParticipations) : 0;

  const stats = {
    ...quizStats,
    totalAnswers,
    correctAnswers,
    accuracy,
    averageScore,
    totalParticipations,
  };

  return (
    <div className="min-h-screen colorblock-bg-pattern p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-[#1F2937] mb-4">
            My Stats
          </h1>
          <p className="text-2xl font-bold text-[#1F2937] opacity-80">
            Track your quiz performance and statistics
          </p>
        </div>
        <StatsClient stats={stats} />
      </div>
    </div>
  );
}
