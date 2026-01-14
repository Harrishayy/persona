import { db } from '../connection';
import { users } from '../schema';
import { eq } from 'drizzle-orm';

/**
 * Syncs WorkOS user data to database
 * Creates user if doesn't exist, updates if exists
 */
export async function syncWorkOSUser(workOSUser: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}) {
  // Generate usertag from email if not exists
  const generateUsertag = (email: string): string => {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    // Ensure it's max 20 chars
    return base.substring(0, 20);
  };

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, workOSUser.id),
  });

  const name = workOSUser.firstName 
    ? `${workOSUser.firstName}${workOSUser.lastName ? ` ${workOSUser.lastName}` : ''}`
    : workOSUser.email.split('@')[0];

  const usertag = existingUser?.usertag || generateUsertag(workOSUser.email);

  if (existingUser) {
    // Update existing user - only update fields that might have changed
    const [updated] = await db
      .update(users)
      .set({
        email: workOSUser.email,
        name: name,
        avatarUrl: workOSUser.imageUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, workOSUser.id))
      .returning();
    
    return updated;
  } else {
    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        id: workOSUser.id,
        email: workOSUser.email,
        name: name,
        usertag: usertag,
        avatarUrl: workOSUser.imageUrl || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: workOSUser.email,
          name: name,
          avatarUrl: workOSUser.imageUrl || null,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    return newUser;
  }
}

/**
 * Get user by WorkOS ID
 */
export async function getUserByWorkOSId(workOSId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, workOSId),
  });
}

/**
 * Delete user by WorkOS ID
 */
export async function deleteUserByWorkOSId(workOSId: string) {
  await db.delete(users).where(eq(users.id, workOSId));
}
