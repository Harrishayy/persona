'use client';

import { useState, useEffect } from 'react';
import type { QuizSession, Question } from '@/lib/types';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { EmojiOptionButton } from '@/components/ui/EmojiOptionButton';
import { Input } from '@/components/ui/Input';
import { getEmojiForOption } from '@/lib/utils/emoji-assignment';
import { Button } from '@/components/ui/Button';
import { Timer } from '@/components/ui/Timer';
import { Card } from '@/components/ui/Card';
import { ScoreDisplay } from '@/components/ui/ScoreDisplay';
import { ParticipantList } from '@/components/ui/ParticipantList';
import { CheckCircle } from 'lucide-react';
import { getErrorMessage } from '@/lib/types/errors';
import { useToast } from '@/lib/hooks/useToast';

interface PlayerViewProps {
  session: QuizSession;
  playerId: string;
  onUpdate: () => void;
}

export function PlayerView({ session, playerId, onUpdate }: PlayerViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const currentQuestion = session.quiz?.questions?.find(
    (q) => q.id === session.currentQuestionId
  );

  const userAnswer = session.quiz?.questions
    ?.find((q) => q.id === session.currentQuestionId)
    ?.options?.find((opt) => {
      // This would need to be fetched from the API
      return false;
    });

  useEffect(() => {
    setSelectedAnswer(null);
    setTextAnswer('');
    setHasAnswered(false);
  }, [session.currentQuestionId]);

  const handleSubmit = async () => {
    if (!currentQuestion || !session.id) return;

    if (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') {
      if (selectedAnswer === null) {
        showToast('Please select an answer', 'warning');
        return;
      }
    } else if (currentQuestion.type === 'text_input') {
      if (!textAnswer.trim()) {
        showToast('Please enter an answer', 'warning');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          sessionId: session.id,
          questionId: currentQuestion.id!,
          optionId: selectedAnswer || undefined,
          answerText: textAnswer || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit answer');
      }

      setHasAnswered(true);
      onUpdate();
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'Failed to submit answer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session.status === 'waiting') {
    return (
      <Card variant="yellow" className="text-center py-12">
        <h2 className="text-4xl font-black mb-4">
          Waiting for quiz to start...
        </h2>
        <p className="text-xl font-bold opacity-90">
          The host will begin the quiz shortly.
        </p>
      </Card>
    );
  }

  if (session.status === 'finished') {
    const userParticipant = session.participants?.find((p) => p.userId === playerId);
    const totalQuestions = session.quiz?.questions?.length || 0;

    return (
      <div className="space-y-6">
        <ScoreDisplay
          score={userParticipant?.score || 0}
          total={totalQuestions}
          label="Your Final Score"
          variant="large"
        />
        <ParticipantList
          participants={session.participants?.map((p) => ({
            id: p.id!,
            userId: p.userId,
            userName: p.userName,
            score: p.score,
          })) || []}
          currentUserId={playerId}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <Card variant="orange" className="text-center py-12">
        <h2 className="text-4xl font-black mb-4">
          Waiting for next question...
        </h2>
      </Card>
    );
  }

  const questionNumber = (session.quiz?.questions?.findIndex((q) => q.id === currentQuestion.id) || 0) + 1;
  const totalQuestions = session.quiz?.questions?.length || 0;

  return (
    <div className="space-y-6">
      <QuestionCard
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        question={currentQuestion.text}
        imageUrl={currentQuestion.imageUrl}
      >
        {currentQuestion.timeLimit && (
          <div className="mb-4">
            <Timer
              initialSeconds={currentQuestion.timeLimit}
              onComplete={() => {
                if (!hasAnswered) {
                  handleSubmit();
                }
              }}
              variant="linear"
            />
          </div>
        )}

        {hasAnswered ? (
          <Card variant="green" className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-black">
              Answer submitted!
            </p>
            <p className="text-lg font-bold opacity-90 mt-2">
              Waiting for next question...
            </p>
          </Card>
        ) : (
          <>
            {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') &&
              currentQuestion.options && (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, idx) => (
                    <EmojiOptionButton
                      key={idx}
                      emoji={getEmojiForOption(idx)}
                      isSelected={selectedAnswer === option.id}
                      onClick={() => setSelectedAnswer(option.id || null)}
                      colorIndex={idx}
                    />
                  ))}
                </div>
              )}

            {currentQuestion.type === 'text_input' && (
              <Input
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Enter your answer..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
            )}

            <Button
              onClick={handleSubmit}
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
              disabled={
                (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') &&
                selectedAnswer === null
              }
            >
              Submit Answer
            </Button>
          </>
        )}
      </QuestionCard>

      <div className="grid md:grid-cols-2 gap-6">
        <ScoreDisplay
          score={
            session.participants?.find((p) => p.userId === playerId)?.score || 0
          }
          total={totalQuestions}
        />
        <ParticipantList
          participants={session.participants?.map((p) => ({
            id: p.id!,
            userId: p.userId,
            userName: p.userName,
            score: p.score,
          })) || []}
          currentUserId={playerId}
        />
      </div>
    </div>
  );
}
