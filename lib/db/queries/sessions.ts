import { db } from '../connection';
import { quizSessions, participants, answers } from '../schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getSessionByCode(code: string) {
  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.code, code),
    with: {
      quiz: {
        with: {
          questions: {
            with: {
              options: true,
            },
            orderBy: (questions, { asc }) => [asc(questions.order)],
          },
        },
      },
      participants: true,
    },
  });
  return session;
}

export async function getSessionById(id: number) {
  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.id, id),
    with: {
      quiz: {
        with: {
          questions: {
            with: {
              options: true,
            },
            orderBy: (questions, { asc }) => [asc(questions.order)],
          },
        },
      },
      participants: true,
    },
  });
  return session;
}

export async function createSession(data: {
  quizId: number;
  code: string;
}) {
  const [session] = await db.insert(quizSessions).values(data).returning();
  return session;
}

export async function updateSession(id: number, data: {
  status?: string;
  currentQuestionId?: number | null;
  startedAt?: Date;
  endedAt?: Date;
}) {
  const [session] = await db
    .update(quizSessions)
    .set(data)
    .where(eq(quizSessions.id, id))
    .returning();
  return session;
}

export async function addParticipant(data: {
  sessionId: number;
  userId: string;
  userName?: string;
}) {
  const [participant] = await db.insert(participants).values(data).returning();
  return participant;
}

export async function getParticipant(sessionId: number, userId: string) {
  return await db.query.participants.findFirst({
    where: (participants, { and, eq }) => and(
      eq(participants.sessionId, sessionId),
      eq(participants.userId, userId)
    ),
  });
}

export async function updateParticipantScore(sessionId: number, userId: string, score: number) {
  const [participant] = await db
    .update(participants)
    .set({ score })
    .where(and(
      eq(participants.sessionId, sessionId),
      eq(participants.userId, userId)
    ))
    .returning();
  return participant;
}

export async function getSessionParticipants(sessionId: number) {
  return await db.query.participants.findMany({
    where: eq(participants.sessionId, sessionId),
    orderBy: [desc(participants.score)],
  });
}
