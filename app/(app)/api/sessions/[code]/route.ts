import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizSessions, participants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { convertQuizSession } from '@/lib/types/converters';
import type { DatabaseQuizSession } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

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

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Convert database session to app type
    const convertedSession = convertQuizSession(session as DatabaseQuizSession);
    return NextResponse.json(convertedSession);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    const body = await request.json();

    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.code, code),
      with: {
        quiz: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify ownership
    if (session.quiz.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [updated] = await db
      .update(quizSessions)
      .set(body)
      .where(eq(quizSessions.code, code))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    const body = await request.json();
    const { userName } = body;

    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.code, code),
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status === 'finished') {
      return NextResponse.json({ error: 'Session has ended' }, { status: 400 });
    }

    // Check if already joined
    const sessionId = (session as any).sessionId || (session as any).id;
    const existing = await db.query.participants.findFirst({
      where: (participants, { and, eq }) => and(
        eq(participants.sessionId, sessionId),
        eq(participants.userId, user.id)
      ),
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const [participant] = await db.insert(participants).values({
      sessionId: sessionId,
      userId: user.id,
      userName: userName || user.firstName || user.email || undefined,
    }).returning();

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
