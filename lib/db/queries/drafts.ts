import { db } from '../connection';
import { quizzes } from '../schema';
import { eq, and } from 'drizzle-orm';

export interface DraftData {
  title: string;
  description?: string;
  imageUrl?: string;
  emoji?: string;
  isPublic: boolean;
  gameMode: string;
  rounds?: Array<{
    gameMode: string;
    order: number;
    title?: string;
    description?: string;
  }>;
  questions: Array<{
    type: string;
    text: string;
    imageUrl?: string;
    order: number;
    timeLimit?: number;
    roundId?: number;
    options?: Array<{
      text: string;
      isCorrect: boolean;
      order: number;
    }>;
  }>;
}

/**
 * Save draft data for a user
 */
export async function saveDraft(userId: string, draftData: DraftData) {
  // Find existing draft quiz for user
  const existingDraft = await db.query.quizzes.findFirst({
    where: (quizzes, { eq: eqFn, and: andFn }) => andFn(
      eqFn(quizzes.hostId, userId),
      eqFn(quizzes.status, 'draft')
    ),
  });

  if (existingDraft) {
    // Update existing draft
    const [updated] = await db
      .update(quizzes)
      .set({
        draftData: draftData as any,
        updatedAt: new Date(),
      })
      .where(eq(quizzes.quizId, existingDraft.quizId))
      .returning();

    return updated;
  } else {
    // Create new draft quiz
    const [newDraft] = await db
      .insert(quizzes)
      .values({
        title: draftData.title || 'Untitled Quiz',
        description: draftData.description || null,
        hostId: userId,
        status: 'draft',
        imageUrl: draftData.imageUrl || null,
        emoji: draftData.emoji || null,
        isPublic: draftData.isPublic || false,
        gameMode: draftData.gameMode || 'standard',
        draftData: draftData as any,
      })
      .returning();

    return newDraft;
  }
}

/**
 * Get draft data for a user
 */
export async function getDraft(userId: string): Promise<DraftData | null> {
  const draft = await db.query.quizzes.findFirst({
    where: (quizzes, { eq: eqFn, and: andFn }) => andFn(
      eqFn(quizzes.hostId, userId),
      eqFn(quizzes.status, 'draft')
    ),
  });

  if (!draft || !draft.draftData) {
    return null;
  }

  return draft.draftData as DraftData;
}

/**
 * Delete draft for a user
 */
export async function deleteDraft(userId: string) {
  await db
    .delete(quizzes)
    .where(and(
      eq(quizzes.hostId, userId),
      eq(quizzes.status, 'draft')
    ));
}
