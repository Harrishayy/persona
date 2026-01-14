import { syncWorkOSUser } from '@/lib/db/queries/users';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * Ensures user exists in database, syncs if needed
 * Call this in pages/API routes that need user data
 * This is a "lazy sync" approach - syncs on first access
 */
export async function ensureUserSynced() {
  const { user } = await withAuth();
  
  if (!user) {
    return null;
  }

  // Sync user to database
  return await syncWorkOSUser({
    id: user.id,
    email: user.email,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    imageUrl: user.imageUrl || null,
  });
}
