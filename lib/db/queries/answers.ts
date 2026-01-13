import { db } from '../connection';
import { answers, questionOptions } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function submitAnswer(data: {
  sessionId: number;
  questionId: number;
  userId: string;
  answerText?: string;
  optionId?: number;
}) {
  // Check if answer is correct
  let isCorrect = false;
  if (data.optionId) {
    const option = await db.query.questionOptions.findFirst({
      where: eq(questionOptions.id, data.optionId),
    });
    isCorrect = option?.isCorrect ?? false;
  }

  const [answer] = await db.insert(answers).values({
    ...data,
    isCorrect,
  }).returning();
  return answer;
}

export async function getAnswer(sessionId: number, questionId: number, userId: string) {
  return await db.query.answers.findFirst({
    where: (answers, { and, eq }) => and(
      eq(answers.sessionId, sessionId),
      eq(answers.questionId, questionId),
      eq(answers.userId, userId)
    ),
  });
}

export async function getQuestionAnswers(sessionId: number, questionId: number) {
  return await db.query.answers.findMany({
    where: (answers, { and, eq }) => and(
      eq(answers.sessionId, sessionId),
      eq(answers.questionId, questionId)
    ),
  });
}

export async function getUserAnswers(sessionId: number, userId: string) {
  return await db.query.answers.findMany({
    where: (answers, { and, eq }) => and(
      eq(answers.sessionId, sessionId),
      eq(answers.userId, userId)
    ),
  });
}
