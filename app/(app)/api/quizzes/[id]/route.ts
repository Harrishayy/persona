import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizzes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quizId = parseInt(id);

    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.quizId, quizId),
      with: {
        questions: {
          with: {
            options: {
              orderBy: (options, { asc }) => [asc(options.order)],
            },
          },
          orderBy: (questions, { asc }) => [asc(questions.order)],
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Verify user has permission to view this quiz
    if (quiz.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quizId = parseInt(id);

    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.quizId, quizId),
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(quizzes).where(eq(quizzes.quizId, quizId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quizId = parseInt(id);
    const body = await request.json();

    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.quizId, quizId),
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [updated] = await db
      .update(quizzes)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(quizzes.quizId, quizId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
