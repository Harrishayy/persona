import type { Question } from '@/lib/types/app';
import { convertQuestion } from '@/lib/types/converters';

/**
 * Converts quiz data from API response to app Question format
 * Handles both Drizzle field names (questionId, optionId) and app format (id)
 */
export function convertQuizToQuestions(quiz: any): Question[] {
  return (quiz.questions || []).map((q: any) => {
    try {
      const dbQuestion = {
        id: q.questionId ?? q.id,
        quizId: q.quizId,
        roundId: q.roundId ?? null,
        type: q.type,
        text: q.text,
        imageUrl: q.imageUrl ?? null,
        order: q.order,
        timeLimit: q.timeLimit ?? null,
        createdAt: q.createdAt || new Date(),
        options: q.options?.map((opt: any) => ({
          id: opt.optionId ?? opt.id,
          questionId: opt.questionId ?? q.questionId ?? q.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
          createdAt: opt.createdAt || new Date(),
        })) ?? [],
      };
      return convertQuestion(dbQuestion);
    } catch (err) {
      console.error('Error converting question:', err, q);
      // Return fallback question structure if conversion fails
      return {
        type: q.type || 'multiple_choice',
        text: q.text || '',
        order: q.order || 0,
        imageUrl: q.imageUrl || undefined,
        timeLimit: q.timeLimit || undefined,
        options: q.options?.map((opt: any) => ({
          text: opt.text || '',
          isCorrect: opt.isCorrect || false,
          order: opt.order || 0,
        })) || [],
      };
    }
  });
}
