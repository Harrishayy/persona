'use client';

import { useEffect, useState } from 'react';
import type { QuizSession } from '@/lib/types';
import { PlayerView } from '@/components/quiz/PlayerView';

interface PlayPageClientProps {
  session: QuizSession;
  playerId: string;
}

export function PlayPageClient({ session: initialSession, playerId }: PlayPageClientProps) {
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

  return <PlayerView session={session} playerId={playerId} onUpdate={fetchSession} />;
}
