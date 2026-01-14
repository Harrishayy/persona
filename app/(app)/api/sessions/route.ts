import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizSessions, quizzes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateUniqueCode } from '@/lib/utils/code-generator';

export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { quizId } = body;

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Verify quiz exists and is available for hosting
    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.quizId, quizId),
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Allow hosting if user owns the quiz OR if quiz is public
    if (quiz.hostId !== user.id && !quiz.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate unique session code
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

    const createdSession = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.sessionId, session.sessionId),
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
      },
    });

    return NextResponse.json(createdSession, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
