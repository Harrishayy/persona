import type { Metadata } from 'next';
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components';
import './globals.css';

export const metadata: Metadata = {
  title: 'Persona',
  description: 'Create and play interactive quizzes with friends!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthKitProvider>{children}</AuthKitProvider>
      </body>
    </html>
  );
}

