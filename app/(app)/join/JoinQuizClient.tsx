'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CodeInput } from '@/components/ui/CodeInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/types/errors';

export function JoinQuizClient() {
  const [code, setCode] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-character code');
      return;
    }

    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Join session via API (works for both authenticated and anonymous users)
      const response = await fetch(`/api/sessions/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName: userName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join session');
      }

      router.push(`/play/${code}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        label="Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Enter your name..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && code.length === 6 && userName.trim()) {
            handleJoin();
          }
        }}
      />
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
        disabled={code.length !== 6 || !userName.trim()}
      >
        Join Quiz
      </Button>
    </div>
  );
}
