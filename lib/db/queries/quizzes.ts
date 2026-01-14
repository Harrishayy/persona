import { db } from '../connection';
import { quizzes, questions, questionOptions } from '../schema';
import { eq, desc, and, or, ilike } from 'drizzle-orm';

export async function getQuizById(id: number) {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.quizId, id),
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

// Removed getQuizByCode - quizzes no longer have codes
// Use getQuizById instead

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
    .where(eq(quizzes.quizId, id))
    .returning();
  return quiz;
}

export async function deleteQuiz(id: number) {
  await db.delete(quizzes).where(eq(quizzes.quizId, id));
}

export async function getPublishedQuizzes(search?: string) {
  const conditions = [
    eq(quizzes.status, 'published'),
    eq(quizzes.isPublic, true)
  ];
  
  if (search) {
    conditions.push(
      or(
        ilike(quizzes.title, `%${search}%`),
        ilike(quizzes.description, `%${search}%`)
      )!
    );
  }

  return await db.query.quizzes.findMany({
    where: and(...conditions),
    orderBy: [desc(quizzes.createdAt)],
    limit: 50,
  });
}

export async function getQuizStats(hostId: string) {
  const userQuizzes = await db.query.quizzes.findMany({
    where: eq(quizzes.hostId, hostId),
    with: {
      sessions: {
        with: {
          participants: true,
        },
      },
    },
  });

  const totalQuizzes = userQuizzes.length;
  const totalSessions = userQuizzes.reduce((sum, quiz) => sum + quiz.sessions.length, 0);
  const totalParticipants = userQuizzes.reduce(
    (sum, quiz) => sum + quiz.sessions.reduce((s, session) => s + session.participants.length, 0),
    0
  );
  const publishedQuizzes = userQuizzes.filter(q => q.status === 'published').length;

  return {
    totalQuizzes,
    totalSessions,
    totalParticipants,
    publishedQuizzes,
  };
}
