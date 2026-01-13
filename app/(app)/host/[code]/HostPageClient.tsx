'use client';

import { useEffect, useState } from 'react';
import type { QuizSession } from '@/lib/types';
import { HostDashboard } from '@/components/quiz/HostDashboard';

interface HostPageClientProps {
  session: QuizSession;
}

export function HostPageClient({ session: initialSession }: HostPageClientProps) {
  const [session, setSession] = useState(initialSession);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${initialSession.code}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  useEffect(() => {
    if (session.status === 'active' || session.status === 'waiting') {
      const interval = setInterval(fetchSession, 2000);
      return () => clearInterval(interval);
    }
  }, [session.status, initialSession.code]);

  return <HostDashboard session={session} onUpdate={fetchSession} />;
}
