'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizSession } from '@/lib/types';
import { PlayerView } from '@/components/quiz/PlayerView';
import { useToast } from '@/lib/hooks/useToast';

interface PlayPageClientProps {
  session: QuizSession;
  playerId: string;
}

export function PlayPageClient({ session: initialSession, playerId }: PlayPageClientProps) {
  const [session, setSession] = useState(initialSession);
  const router = useRouter();
  const { showToast } = useToast();
  const hasBeenKickedRef = useRef(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRedirect = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
    redirectTimeoutRef.current = setTimeout(() => {
      router.push('/join');
    }, 2000);
  }, [router]);

  const fetchSession = useCallback(async () => {
    // Don't continue polling if already kicked
    if (hasBeenKickedRef.current) return;

    try {
      const response = await fetch(`/api/sessions/${initialSession.code}`);
      if (response.ok) {
        const data = await response.json();
        
        // Check if player is still in participants list
        const isStillParticipant = data.participants?.some(
          (p: any) => p.userId === playerId
        );
        
        if (!isStillParticipant && !hasBeenKickedRef.current) {
          // Player was kicked - show notification and redirect
          hasBeenKickedRef.current = true;
          showToast('You have been removed from this quiz session', 'error');
          scheduleRedirect(); // Give user time to see the message
          return;
        }
        
        setSession(data);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  }, [initialSession.code, playerId, router, showToast]);

  useEffect(() => {
    // Initial check when component mounts
    const isStillParticipant = initialSession.participants?.some(
      (p: any) => p.userId === playerId
    );
    
    if (!isStillParticipant && initialSession.status !== 'finished' && !hasBeenKickedRef.current) {
      // Player was already kicked before component mounted
      hasBeenKickedRef.current = true;
      showToast('You have been removed from this quiz session', 'error');
      scheduleRedirect();
      return;
    }

    if (session.status === 'active' || session.status === 'waiting') {
      const interval = setInterval(fetchSession, 2000);
      return () => clearInterval(interval);
    }
  }, [session.status, initialSession, playerId, router, showToast, fetchSession, scheduleRedirect]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Don't render PlayerView if kicked
  if (hasBeenKickedRef.current) {
    return null;
  }

  return <PlayerView session={session} playerId={playerId} onUpdate={fetchSession} />;
}
