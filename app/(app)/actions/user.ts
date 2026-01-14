'use server';

import { withAuth } from '@workos-inc/authkit-nextjs';
import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function updateUser(data: {
  name?: string;
  bio?: string | null;
  details?: string | null;
  usertag?: string;
}) {
  const { user } = await withAuth();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const updateData: {
    name?: string;
    bio?: string | null;
    details?: string | null;
    usertag?: string;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.bio !== undefined) updateData.bio = data.bio || null;
  if (data.details !== undefined) updateData.details = data.details || null;

  // Handle usertag update with uniqueness check
  if (data.usertag !== undefined) {
    // Validate usertag format (alphanumeric, lowercase, max 20 chars)
    const normalizedUsertag = data.usertag.toLowerCase().trim();
    if (normalizedUsertag.length === 0) {
      throw new Error('Usertag cannot be empty');
    }
    if (normalizedUsertag.length > 20) {
      throw new Error('Usertag must be 20 characters or less');
    }
    if (!/^[a-z0-9_]+$/.test(normalizedUsertag)) {
      throw new Error('Usertag can only contain lowercase letters, numbers, and underscores');
    }

    // Check if usertag is already taken by another user
    const existingUser = await db.query.users.findFirst({
      where: (users, { and, eq, ne }) => and(
        eq(users.usertag, normalizedUsertag),
        ne(users.id, user.id)
      ),
    });

    if (existingUser) {
      throw new Error('This usertag is already taken');
    }

    updateData.usertag = normalizedUsertag;
  }

  try {
    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    return updated;
  } catch (error) {
    console.error('Error updating user:', error);
    // Handle database unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      throw new Error('This usertag is already taken');
    }
    throw error;
  }
}
