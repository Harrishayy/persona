'use server';

import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizzes, questions, questionOptions, rounds } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { quizSchema } from '@/lib/utils/validation';
import { generateUniqueCode } from '@/lib/utils/code-generator';

export async function createQuiz(data: {
  title: string;
  description?: string;
  imageUrl?: string;
  emoji?: string;
  isPublic?: boolean;
  gameMode?: string;
  rounds?: Array<{
    gameMode: string;
    order: number;
    title?: string;
    description?: string;
  }>;
  questions: Array<{
    type: string;
    text: string;
    imageUrl?: string;
    order: number;
    timeLimit?: number;
    roundId?: number;
    options?: Array<{
      text: string;
      isCorrect: boolean;
      order: number;
    }>;
  }>;
}) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = quizSchema.parse(data);

  const code = await generateUniqueCode(async (code) => {
    const existing = await db.query.quizzes.findFirst({
      where: eq(quizzes.code, code),
    });
    return !!existing;
  });

  // Create quiz
  const [quiz] = await db.insert(quizzes).values({
    title: validated.title,
    description: validated.description || null,
    hostId: user.id,
    code,
    status: 'published',
    imageUrl: validated.imageUrl || null,
    emoji: validated.emoji || null,
    isPublic: validated.isPublic || false,
    gameMode: validated.gameMode || 'standard',
  }).returning();

  // Create rounds if they exist
  const roundIdMap = new Map<number, number>();
  if (validated.rounds && validated.rounds.length > 0) {
    for (const roundData of validated.rounds) {
      const [round] = await db.insert(rounds).values({
        quizId: quiz.quizId,
        gameMode: roundData.gameMode,
        order: roundData.order,
        title: roundData.title || null,
        description: roundData.description || null,
      }).returning();
      roundIdMap.set(roundData.order, round.roundId);
    }
  }

  // Create questions
  for (const questionData of validated.questions) {
    let roundId: number | null = null;
    if (questionData.roundId !== undefined) {
      if (roundIdMap.has(questionData.roundId)) {
        roundId = roundIdMap.get(questionData.roundId)!;
      } else if (questionData.roundId > 0) {
        roundId = questionData.roundId;
      }
    }

    const [question] = await db.insert(questions).values({
      quizId: quiz.quizId,
      roundId,
      type: questionData.type,
      text: questionData.text,
      imageUrl: questionData.imageUrl || null,
      order: questionData.order,
      timeLimit: questionData.timeLimit || null,
    }).returning();

    if (questionData.options && questionData.options.length > 0) {
      await db.insert(questionOptions).values(
        questionData.options.map((opt) => ({
          questionId: question.questionId,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        }))
      );
    }
  }

  return { id: quiz.quizId, code: quiz.code };
}

export async function getUserQuizzes() {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return await db.query.quizzes.findMany({
    where: eq(quizzes.hostId, user.id),
    orderBy: (quizzes, { desc }) => [desc(quizzes.createdAt)],
  });
}

export async function updateQuiz(
  quizId: number,
  data: {
    title: string;
    description?: string;
    imageUrl?: string;
    emoji?: string;
    isPublic?: boolean;
    gameMode?: string;
    questions: Array<{
      type: string;
      text: string;
      imageUrl?: string;
      order: number;
      timeLimit?: number;
      options?: Array<{
        text: string;
        isCorrect: boolean;
        order: number;
      }>;
    }>;
  }
) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify quiz exists and user owns it
  const existingQuiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.quizId, quizId),
  });

  if (!existingQuiz) {
    throw new Error('Quiz not found');
  }

  if (existingQuiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  const validated = quizSchema.parse(data);

  // Update quiz metadata
  await db.update(quizzes).set({
    title: validated.title,
    description: validated.description || null,
    imageUrl: validated.imageUrl || null,
    emoji: validated.emoji || null,
    isPublic: validated.isPublic || false,
    gameMode: validated.gameMode || 'standard',
    updatedAt: new Date(),
  }).where(eq(quizzes.quizId, quizId));

  // Delete existing questions and options
  const existingQuestions = await db.query.questions.findMany({
    where: eq(questions.quizId, quizId),
  });

  for (const question of existingQuestions) {
    await db.delete(questionOptions).where(eq(questionOptions.questionId, question.questionId));
  }
  await db.delete(questions).where(eq(questions.quizId, quizId));

  // Create new questions and options
  for (const questionData of validated.questions) {
    const [question] = await db.insert(questions).values({
      quizId,
      roundId: null, // No rounds support
      type: questionData.type,
      text: questionData.text,
      imageUrl: questionData.imageUrl || null,
      order: questionData.order,
      timeLimit: questionData.timeLimit || null,
    }).returning();

    if (questionData.options && questionData.options.length > 0) {
      await db.insert(questionOptions).values(
        questionData.options.map((opt) => ({
          questionId: question.questionId,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        }))
      );
    }
  }

  return { id: quizId, code: existingQuiz.code };
}
