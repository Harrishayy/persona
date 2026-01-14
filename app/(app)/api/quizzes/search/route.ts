import { NextRequest, NextResponse } from 'next/server';
import { getPublishedQuizzes } from '@/lib/db/queries/quizzes';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('q') || undefined;

    const quizzes = await getPublishedQuizzes(search);
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error searching quizzes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
