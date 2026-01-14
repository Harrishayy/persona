'use server';

import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizzes, questions, questionOptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { quizSchema } from '@/lib/utils/validation';

export async function createQuiz(data: {
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
}) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = quizSchema.parse(data);

  // Create quiz
  const [quiz] = await db.insert(quizzes).values({
    title: validated.title,
    description: validated.description || null,
    hostId: user.id,
    status: 'published',
    imageUrl: validated.imageUrl || null,
    emoji: validated.emoji || null,
    isPublic: validated.isPublic || false,
    gameMode: validated.gameMode || 'standard',
  }).returning();

  // Create questions
  for (const questionData of validated.questions) {
    const [question] = await db.insert(questions).values({
      quizId: quiz.quizId,
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

  return { id: quiz.quizId };
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
  quizId: string,
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

  return { id: quizId };
}

export async function getQuizById(quizId: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!quizId || typeof quizId !== 'string') {
    throw new Error('Invalid quiz ID');
  }

  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.quizId, quizId),
    with: {
      questions: {
        with: {
          options: true,
        },
        orderBy: (questions, { asc }) => [asc(questions.order)],
      },
    },
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Verify user has permission to view this quiz
  if (quiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  // Sort options manually since orderBy in nested relations can be problematic
  const quizWithSortedOptions = {
    ...quiz,
    questions: quiz.questions?.map((q) => ({
      ...q,
      options: q.options && Array.isArray(q.options) 
        ? q.options.sort((a, b) => (a.order || 0) - (b.order || 0))
        : [],
    })) || [],
  };

  return quizWithSortedOptions;
}

export async function deleteQuiz(quizId: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!quizId || typeof quizId !== 'string') {
    throw new Error('Invalid quiz ID');
  }

  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.quizId, quizId),
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  if (quiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  // Delete the quiz (cascade will handle related records)
  await db.delete(quizzes).where(eq(quizzes.quizId, quizId));

  return { success: true };
}
