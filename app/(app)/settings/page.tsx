import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { SettingsClient } from './SettingsClient';
import { ensureUserSynced } from '@/lib/utils/user-sync';
import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function SettingsPage() {
  const { user } = await withAuth();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Ensure user is synced to database (lazy sync approach)
  await ensureUserSynced();

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  const userData = dbUser 
    ? {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        usertag: dbUser.usertag,
        bio: dbUser.bio ?? undefined,
        details: dbUser.details ?? undefined,
        avatarUrl: dbUser.avatarUrl ?? undefined,
      }
    : {
        id: user.id,
        email: user.email,
        name: user.firstName || '',
        usertag: user.email.split('@')[0],
      };

  return (
    <div className="min-h-screen colorblock-bg-pattern p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-[#1F2937] mb-4">
            Settings
          </h1>
          <p className="text-2xl font-bold text-[#1F2937] opacity-80">
            Manage your account and preferences
          </p>
        </div>
        <SettingsClient user={userData} />
      </div>
    </div>
  );
}
