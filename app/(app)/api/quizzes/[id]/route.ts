import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizzes, questions, questionOptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { quizSchema } from '@/lib/utils/validation';
import { getErrorMessage } from '@/lib/types/errors';
import { ZodError } from 'zod';

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
    const quizId = id;

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
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Verify user has permission to view this quiz
    if (quiz.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    return NextResponse.json(quizWithSortedOptions);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
    const quizId = id;

    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.quizId, quizId),
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the quiz (cascade will handle related records)
    await db.delete(quizzes).where(eq(quizzes.quizId, quizId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
    const quizId = id;

    const body = await request.json();
    const validated = quizSchema.parse(body);

    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.quizId, quizId),
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.hostId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    const updatedQuiz = await db.query.quizzes.findFirst({
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

    return NextResponse.json(updatedQuiz);
  } catch (error: unknown) {
    console.error('Error updating quiz:', error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', message: getErrorMessage(error) }, { status: 500 });
  }
}
