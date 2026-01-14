'use server';

import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizSessions, participants, quizzes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateUniqueCode } from '@/lib/utils/code-generator';

export async function createSession(quizId: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.quizId, quizId),
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Allow hosting if user owns the quiz OR if quiz is public
  if (quiz.hostId !== user.id && !quiz.isPublic) {
    throw new Error('Forbidden');
  }

  const code = await generateUniqueCode(async (code) => {
    const existing = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.code, code),
    });
    return !!existing;
  });

  const [session] = await db.insert(quizSessions).values({
    quizId,
    code,
    status: 'waiting',
  }).returning();

  return { id: session.sessionId, code: session.code };
}

export async function joinSession(code: string, userName?: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status === 'finished') {
    throw new Error('Session has ended');
  }

  const existing = await db.query.participants.findFirst({
    where: (participants, { and, eq }) => and(
      eq(participants.sessionId, session.id),
      eq(participants.userId, user.id)
    ),
  });

  if (existing) {
    return existing;
  }

  const [participant] = await db.insert(participants).values({
    sessionId: session.id,
    userId: user.id,
    userName: userName || user.firstName || user.email || undefined,
  }).returning();

  return participant;
}

export async function startSession(code: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
    with: {
      quiz: true,
    },
  });

  if (!session || session.quiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  const [updated] = await db
    .update(quizSessions)
    .set({
      status: 'active',
      startedAt: new Date(),
    })
    .where(eq(quizSessions.code, code))
    .returning();

  return updated;
}

export async function updateSessionQuestion(code: string, questionId: string | null) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
    with: {
      quiz: true,
    },
  });

  if (!session || session.quiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  const [updated] = await db
    .update(quizSessions)
    .set({ 
      currentQuestionId: questionId,
      resultsView: null, // Reset results view when moving to new question
    })
    .where(eq(quizSessions.code, code))
    .returning();

  return updated;
}

export async function showBarChart(code: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
    with: {
      quiz: true,
    },
  });

  if (!session || session.quiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  const [updated] = await db
    .update(quizSessions)
    .set({ resultsView: 'barChart' })
    .where(eq(quizSessions.code, code))
    .returning();

  return updated;
}

export async function showRanking(code: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
    with: {
      quiz: true,
    },
  });

  if (!session || session.quiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  const [updated] = await db
    .update(quizSessions)
    .set({ resultsView: 'ranking' })
    .where(eq(quizSessions.code, code))
    .returning();

  return updated;
}

export async function hideResults(code: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
    with: {
      quiz: true,
    },
  });

  if (!session || session.quiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  const [updated] = await db
    .update(quizSessions)
    .set({ resultsView: null })
    .where(eq(quizSessions.code, code))
    .returning();

  return updated;
}

export async function endSession(code: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
    with: {
      quiz: true,
    },
  });

  if (!session || session.quiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  const [updated] = await db
    .update(quizSessions)
    .set({
      status: 'finished',
      endedAt: new Date(),
    })
    .where(eq(quizSessions.code, code))
    .returning();

  return updated;
}

export async function deleteSession(code: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
    with: {
      quiz: true,
    },
  });

  if (!session || session.quiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  await db
    .delete(quizSessions)
    .where(eq(quizSessions.code, code));

  return { success: true };
}

export async function kickParticipant(code: string, userId: string) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
    with: {
      quiz: true,
    },
  });

  if (!session || session.quiz.hostId !== user.id) {
    throw new Error('Forbidden');
  }

  // Delete participant from the session
  await db
    .delete(participants)
    .where(
      and(
        eq(participants.sessionId, session.sessionId),
        eq(participants.userId, userId)
      )
    );

  return { success: true };
}
