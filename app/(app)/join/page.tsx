import { Card } from '@/components/ui/Card';
import { JoinQuizClient } from './JoinQuizClient';
import { Gamepad2 } from 'lucide-react';

export default function JoinQuizPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card variant="green" className="max-w-md w-full text-white">
        <div className="text-center mb-6">
          <Gamepad2 className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-5xl font-black mb-2">
            Join a Quiz
          </h1>
          <p className="text-lg font-bold opacity-90">
            Enter the quiz code to join a live session
          </p>
        </div>
        <JoinQuizClient />
      </Card>
    </div>
  );
}
