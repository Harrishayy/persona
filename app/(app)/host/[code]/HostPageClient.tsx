'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizSession } from '@/lib/types';
import { HostDashboard } from '@/components/quiz/HostDashboard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { deleteSession } from '@/app/(app)/actions/session';
import { useToast } from '@/lib/hooks/useToast';
import { getErrorMessage } from '@/lib/types/errors';

interface HostPageClientProps {
  session: QuizSession;
}

export function HostPageClient({ session: initialSession }: HostPageClientProps) {
  const [session, setSession] = useState(initialSession);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

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

  // Handle browser back button
  useEffect(() => {
    // Push initial state to enable back button detection
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      setShowExitModal(true);
      // Push state back to prevent navigation
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleConfirmExit = async () => {
    setIsDeleting(true);
    try {
      await deleteSession(session.code);
      showToast('Quiz session ended and deleted', 'success');
      router.push('/');
    } catch (error) {
      showToast(getErrorMessage(error) || 'Failed to delete session', 'error');
      setIsDeleting(false);
    }
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    // Restore history state after canceling
    window.history.pushState(null, '', window.location.href);
  };

  return (
    <>
      <HostDashboard session={session} onUpdate={fetchSession} />
      <Modal
        isOpen={showExitModal}
        onClose={handleCancelExit}
        title="End Quiz Session?"
        size="md"
        color="orange"
        showCloseButton={false}
      >
        <div className="space-y-6">
          <p className="text-lg font-bold">
            Are you sure you want to leave? This will end the quiz session and remove it from the database.
          </p>
          <p className="text-base opacity-90">
            All participants will be disconnected and the session data will be permanently deleted.
          </p>
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={handleCancelExit}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmExit}
              isLoading={isDeleting}
            >
              End Session
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
