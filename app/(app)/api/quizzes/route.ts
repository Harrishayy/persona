import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizzes, questions, questionOptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { quizSchema } from '@/lib/utils/validation';
import { getErrorMessage } from '@/lib/types/errors';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's quizzes
    const userQuizzes = await db.query.quizzes.findMany({
      where: eq(quizzes.hostId, user.id),
      orderBy: (quizzes, { desc }) => [desc(quizzes.createdAt)],
    });

    return NextResponse.json(userQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = quizSchema.parse(body);

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

      // Create options for multiple choice and true/false
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

    const createdQuiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.quizId, quiz.quizId),
      with: {
        questions: {
          with: {
            options: true,
          },
          orderBy: (questions, { asc }) => [asc(questions.order)],
        },
      },
    });

    return NextResponse.json(createdQuiz, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating quiz:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    if (error instanceof ZodError) {
      console.error('Validation error details:', error.issues);
      return NextResponse.json({ 
        error: 'Validation error', 
        message: errorMessage,
        details: error.issues,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      }, { status: 400 });
    }
    
    console.error('Full error:', {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      error: error
    });
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: errorMessage,
      name: errorName,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}
