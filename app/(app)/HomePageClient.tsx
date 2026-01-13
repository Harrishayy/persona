'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CodeInput } from '@/components/ui/CodeInput';
import { Button } from '@/components/ui/Button';
import { joinSession } from './actions/session';
import { getErrorMessage } from '@/lib/types/errors';

export function HomePageClient() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-character code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await joinSession(code);
      router.push(`/play/${code}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <CodeInput
        value={code}
        onChange={setCode}
        error={error}
      />
      <Button
        onClick={handleJoin}
        variant="primary"
        className="w-full"
        size="lg"
        isLoading={isLoading}
        disabled={code.length !== 6}
      >
        Join Quiz
      </Button>
    </div>
  );
}
