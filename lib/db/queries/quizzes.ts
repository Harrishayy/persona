import { db } from '../connection';
import { quizzes, questions, questionOptions } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getQuizById(id: number) {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, id),
    with: {
      questions: {
        with: {
          options: true,
        },
        orderBy: (questions, { asc }) => [asc(questions.order)],
      },
    },
  });
  return quiz;
}

export async function getQuizByCode(code: string) {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.code, code),
    with: {
      questions: {
        with: {
          options: true,
        },
        orderBy: (questions, { asc }) => [asc(questions.order)],
      },
    },
  });
  return quiz;
}

export async function getQuizzesByHostId(hostId: string) {
  return await db.query.quizzes.findMany({
    where: eq(quizzes.hostId, hostId),
    orderBy: [desc(quizzes.createdAt)],
  });
}

export async function createQuiz(data: {
  title: string;
  description?: string;
  hostId: string;
  code: string;
}) {
  const [quiz] = await db.insert(quizzes).values(data).returning();
  return quiz;
}

export async function updateQuiz(id: number, data: {
  title?: string;
  description?: string;
  status?: string;
}) {
  const [quiz] = await db
    .update(quizzes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(quizzes.id, id))
    .returning();
  return quiz;
}

export async function deleteQuiz(id: number) {
  await db.delete(quizzes).where(eq(quizzes.id, id));
}
