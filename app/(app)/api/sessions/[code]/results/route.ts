import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizSessions, questionResults, answers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.code, code),
      with: {
        quiz: true,
      },
    });

    if (!session || session.quiz.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!session.currentQuestionId) {
      return NextResponse.json({ error: 'No active question' }, { status: 400 });
    }

    // Get all answers for the current question
    const questionAnswers = await db.query.answers.findMany({
      where: (answers, { and, eq }) => and(
        eq(answers.sessionId, session.sessionId),
        eq(answers.questionId, session.currentQuestionId!)
      ),
    });

    // Calculate answer distribution
    const distribution: Record<string, number> = {};
    let correctCount = 0;

    questionAnswers.forEach((answer) => {
      if (answer.optionId) {
        distribution[answer.optionId] = (distribution[answer.optionId] || 0) + 1;
      }
      if (answer.isCorrect) {
        correctCount++;
      }
    });

    // Check if results already exist for this question
    const existing = await db.query.questionResults.findFirst({
      where: (results, { and, eq }) => and(
        eq(results.sessionId, session.sessionId),
        eq(results.questionId, session.currentQuestionId!)
      ),
    });

    if (existing) {
      // Update existing results
      const [updated] = await db
        .update(questionResults)
        .set({
          answerDistribution: distribution,
          totalAnswers: questionAnswers.length,
          correctAnswers: correctCount,
        })
        .where(eq(questionResults.resultId, existing.resultId))
        .returning();

      return NextResponse.json(updated);
    } else {
      // Create new results record
      const [result] = await db.insert(questionResults).values({
        sessionId: session.sessionId,
        questionId: session.currentQuestionId!,
        answerDistribution: distribution,
        totalAnswers: questionAnswers.length,
        correctAnswers: correctCount,
      }).returning();

      return NextResponse.json(result, { status: 201 });
    }
  } catch (error) {
    console.error('Error saving question results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
