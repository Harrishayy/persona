import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { quizzes, questions, questionOptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { quizSchema } from '@/lib/utils/validation';
import { generateUniqueCode } from '@/lib/utils/code-generator';
import { getErrorMessage } from '@/lib/types/errors';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (code) {
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

      if (!quiz) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
      }

      return NextResponse.json(quiz);
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

    // Generate unique code
    const code = await generateUniqueCode(async (code) => {
      const existing = await db.query.quizzes.findFirst({
        where: eq(quizzes.code, code),
      });
      return !!existing;
    });

    // Create quiz
    const [quiz] = await db.insert(quizzes).values({
      title: validated.title,
      description: validated.description,
      hostId: user.id,
      code,
      status: 'published',
    }).returning();

    // Create questions
    for (const questionData of validated.questions) {
      const [question] = await db.insert(questions).values({
        quizId: quiz.id,
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
            questionId: question.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: opt.order,
          }))
        );
      }
    }

    const createdQuiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.id, quiz.id),
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
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', message: getErrorMessage(error) }, { status: 500 });
  }
}
