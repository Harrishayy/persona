import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { answers, questionOptions, participants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { answerSubmissionSchema } from '@/lib/utils/validation';
import { getErrorMessage } from '@/lib/types/errors';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, ...answerData } = body;
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const validated = answerSubmissionSchema.parse(answerData);

    // Check if already answered
    const existing = await db.query.answers.findFirst({
      where: (answers, { and, eq }) => and(
        eq(answers.sessionId, validated.sessionId),
        eq(answers.questionId, validated.questionId),
        eq(answers.userId, playerId)
      ),
    });

    if (existing) {
      return NextResponse.json({ error: 'Already answered' }, { status: 400 });
    }

    // Check if answer is correct
    let isCorrect = false;
    if (validated.optionId) {
      const option = await db.query.questionOptions.findFirst({
        where: eq(questionOptions.id, validated.optionId),
      });
      isCorrect = option?.isCorrect ?? false;
    }

    const [answer] = await db.insert(answers).values({
      sessionId: validated.sessionId,
      questionId: validated.questionId,
      userId: playerId,
      answerText: validated.answerText || null,
      optionId: validated.optionId || null,
      isCorrect,
    }).returning();

    // Update participant score if correct
    if (isCorrect) {
      const participant = await db.query.participants.findFirst({
        where: (participants, { and, eq }) => and(
          eq(participants.sessionId, validated.sessionId),
          eq(participants.userId, playerId)
        ),
      });

      if (participant) {
        await db
          .update(participants)
          .set({ score: participant.score + 1 })
          .where(eq(participants.id, participant.id));
      }
    }

    return NextResponse.json(answer, { status: 201 });
  } catch (error: unknown) {
    console.error('Error submitting answer:', error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', message: getErrorMessage(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const questionId = searchParams.get('questionId');
    const playerId = searchParams.get('playerId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (questionId) {
      const questionAnswers = await db.query.answers.findMany({
        where: (answers, { and, eq }) => and(
          eq(answers.sessionId, sessionId),
          eq(answers.questionId, questionId)
        ),
        with: {
          // We need to get participant info through a join
          // Since Drizzle doesn't have direct relation, we'll fetch participants separately
        },
      });

      // Fetch participant info for each answer
      const answersWithParticipants = await Promise.all(
        questionAnswers.map(async (answer) => {
          const participant = await db.query.participants.findFirst({
            where: (participants, { and, eq }) => and(
              eq(participants.sessionId, sessionId),
              eq(participants.userId, answer.userId)
            ),
          });

          return {
            ...answer,
            participant: participant ? {
              userName: participant.userName || participant.userId,
              userId: participant.userId,
            } : {
              userName: answer.userId,
              userId: answer.userId,
            },
          };
        })
      );

      // Calculate answer distribution
      const distribution: Record<string, number> = {};
      questionAnswers.forEach((answer) => {
        if (answer.optionId !== null) {
          distribution[answer.optionId] = (distribution[answer.optionId] || 0) + 1;
        }
      });

      return NextResponse.json({
        answers: answersWithParticipants,
        distribution,
      });
    }

    if (playerId) {
      const userAnswers = await db.query.answers.findMany({
        where: (answers, { and, eq }) => and(
          eq(answers.sessionId, sessionId),
          eq(answers.userId, playerId)
        ),
      });
      return NextResponse.json(userAnswers);
    }

    return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
