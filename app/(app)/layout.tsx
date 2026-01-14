import { withAuth } from '@workos-inc/authkit-nextjs';
import { AppHeader } from '@/components/layout/AppHeader';
import { ToastProvider } from '@/lib/hooks/useToast';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await withAuth();

  return (
    <ToastProvider>
      {user && <AppHeader />}
      {children}
    </ToastProvider>
  );
}
