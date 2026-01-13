'use client';

import { useEffect, useState } from 'react';
import type { QuizSession, Question } from '@/lib/types';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { ParticipantList } from '@/components/ui/ParticipantList';
import { HostControls } from '@/components/ui/HostControls';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { updateSessionQuestion, startSession, endSession } from '@/app/(app)/actions/session';
import { getErrorMessage } from '@/lib/types/errors';

interface HostDashboardProps {
  session: QuizSession;
  onUpdate: () => void;
}

export function HostDashboard({ session, onUpdate }: HostDashboardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const questions = session.quiz?.questions || [];

  const handleStart = async () => {
    try {
      await startSession(session.code);
      setCurrentQuestionIndex(0);
      onUpdate();
    } catch (error: unknown) {
      alert(getErrorMessage(error) || 'Failed to start session');
    }
  };

  const handleNext = async () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      try {
        await updateSessionQuestion(session.code, questions[nextIndex].id!);
        setCurrentQuestionIndex(nextIndex);
        onUpdate();
      } catch (error: unknown) {
        alert(getErrorMessage(error) || 'Failed to update question');
      }
    } else {
      handleEnd();
    }
  };

  const handleEnd = async () => {
    try {
      await endSession(session.code);
      onUpdate();
    } catch (error: unknown) {
      alert(getErrorMessage(error) || 'Failed to end session');
    }
  };

  const currentQuestion = currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {session.status === 'waiting' && (
          <Card variant="yellow" className="text-center py-12 text-black">
            <h2 className="text-4xl font-black mb-4">
              Waiting for players...
            </h2>
            <p className="text-xl font-bold mb-6">
              Share code: <span className="font-mono text-3xl font-black">{session.code}</span>
            </p>
            <Badge variant="info" size="lg">
              {session.participants?.length || 0} participants joined
            </Badge>
          </Card>
        )}

        {session.status === 'active' && currentQuestion && (
          <QuestionCard
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            question={currentQuestion.text}
            imageUrl={currentQuestion.imageUrl}
            colorIndex={currentQuestionIndex}
          >
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.text}</span>
                      {option.isCorrect && (
                        <Badge variant="success" size="sm">Correct</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </QuestionCard>
        )}

        {session.status === 'finished' && (
          <Card variant="green" className="text-center py-12 text-white">
            <h2 className="text-4xl font-black mb-4">
              Quiz Finished!
            </h2>
            <p className="text-xl font-bold opacity-90">
              Final scores are displayed on the right.
            </p>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <HostControls
          onStart={handleStart}
          onNext={handleNext}
          onEnd={handleEnd}
          isActive={session.status === 'active'}
          participantCount={session.participants?.length || 0}
          canGoNext={currentQuestionIndex < questions.length - 1}
        />

        {session.participants && session.participants.length > 0 && (
          <ParticipantList
            participants={session.participants.map(p => ({
              id: p.id!,
              userId: p.userId,
              userName: p.userName,
              score: p.score,
            }))}
          />
        )}
      </div>
    </div>
  );
}
