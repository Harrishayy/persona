'use server';

import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizzes, questions, questionOptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { quizSchema } from '@/lib/utils/validation';
import { generateUniqueCode } from '@/lib/utils/code-generator';

export async function createQuiz(data: {
  title: string;
  description?: string;
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

  const code = await generateUniqueCode(async (code) => {
    const existing = await db.query.quizzes.findFirst({
      where: eq(quizzes.code, code),
    });
    return !!existing;
  });

  const [quiz] = await db.insert(quizzes).values({
    title: validated.title,
    description: validated.description,
    hostId: user.id,
    code,
    status: 'published',
  }).returning();

  for (const questionData of validated.questions) {
    const [question] = await db.insert(questions).values({
      quizId: quiz.id,
      type: questionData.type,
      text: questionData.text,
      imageUrl: questionData.imageUrl || null,
      order: questionData.order,
      timeLimit: questionData.timeLimit || null,
    }).returning();

    if (questionData.options && questionData.options.length > 0) {
      await db.insert(questionOptions).values(
        questionData.options.map((opt) => ({
          questionId: question.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        }))
      );
    }
  }

  return { id: quiz.id, code: quiz.code };
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
