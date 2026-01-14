import { Card } from '@/components/ui/Card';
import { JoinQuizClient } from './JoinQuizClient';
import { Gamepad2 } from 'lucide-react';

export default function JoinQuizPage() {
  return (
    <div className="min-h-screen flex items-center justify-center colorblock-bg-pattern p-4 py-8">
      <Card variant="green" className="max-w-md w-full">
        <div className="text-center mb-8">
          <Gamepad2 className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-5xl font-black mb-3">
            Join a Quiz
          </h1>
          <p className="text-xl font-bold opacity-90">
            Enter the quiz code to join a live session
          </p>
        </div>
        <JoinQuizClient />
      </Card>
    </div>
  );
}
