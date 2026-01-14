'use server';

import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { answers, questionOptions, participants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { answerSubmissionSchema } from '@/lib/utils/validation';

export async function submitAnswer(data: {
  sessionId: string;
  questionId: string;
  answerText?: string;
  optionId?: string;
}) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = answerSubmissionSchema.parse(data);

  const existing = await db.query.answers.findFirst({
    where: (answers, { and, eq }) => and(
      eq(answers.sessionId, validated.sessionId),
      eq(answers.questionId, validated.questionId),
      eq(answers.userId, user.id)
    ),
  });

  if (existing) {
    throw new Error('Already answered');
  }

  let isCorrect = false;
  if (validated.optionId) {
    const option = await db.query.questionOptions.findFirst({
      where: eq(questionOptions.optionId, validated.optionId),
    });
    isCorrect = option?.isCorrect ?? false;
  }

  const [answer] = await db.insert(answers).values({
    sessionId: validated.sessionId,
    questionId: validated.questionId,
    userId: user.id,
    answerText: validated.answerText || null,
    optionId: validated.optionId || null,
    isCorrect,
  }).returning();

  if (isCorrect) {
    const participant = await db.query.participants.findFirst({
      where: (participants, { and, eq }) => and(
        eq(participants.sessionId, validated.sessionId),
        eq(participants.userId, user.id)
      ),
    });

    if (participant) {
      await db
        .update(participants)
        .set({ score: participant.score + 1 })
        .where(eq(participants.participantId, participant.participantId));
    }
  }

  return answer;
}
