import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { quizSessions, answers, participants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionCode = searchParams.get('sessionCode');

    if (!sessionCode) {
      return NextResponse.json({ error: 'Session code is required' }, { status: 400 });
    }

    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.code, sessionCode),
      with: {
        participants: {
          orderBy: (participants, { desc }) => [desc(participants.score)],
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get answer statistics for current question
    type AnswerStats = {
      total: number;
      correct: number;
      incorrect: number;
      byOption: Record<string, number>;
    };
    let answerStats: AnswerStats | null = null;
    if (session.currentQuestionId) {
      const questionAnswers = await db.query.answers.findMany({
        where: (answers, { and, eq }) => and(
          eq(answers.sessionId, session.id),
          eq(answers.questionId, session.currentQuestionId!)
        ),
      });

      answerStats = {
        total: questionAnswers.length,
        correct: questionAnswers.filter(a => a.isCorrect).length,
        incorrect: questionAnswers.filter(a => !a.isCorrect).length,
        byOption: {} as Record<string, number>,
      };

      questionAnswers.forEach(answer => {
        if (answer.optionId && answerStats) {
          answerStats.byOption[answer.optionId] = (answerStats.byOption[answer.optionId] || 0) + 1;
        }
      });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        currentQuestionId: session.currentQuestionId,
      },
      participants: session.participants,
      answerStats,
    });
  } catch (error) {
    console.error('Error fetching live data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
