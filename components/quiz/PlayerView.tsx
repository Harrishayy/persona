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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';
import { getErrorMessage } from '@/lib/types/errors';
import { useToast } from '@/lib/hooks/useToast';

interface PlayerViewProps {
  session: QuizSession;
  playerId: string;
  onUpdate: () => void;
}

export function PlayerView({ session, playerId, onUpdate }: PlayerViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false); // Only show result when host finishes
  const { showToast } = useToast();

  // Find current question by ID, handling both id and questionId field names
  const currentQuestion = session.quiz?.questions?.find(
    (q) => {
      const qId = (q as any).id || (q as any).questionId;
      return qId === session.currentQuestionId;
    }
  );

  useEffect(() => {
    setSelectedAnswer(null);
    setTextAnswer('');
    setHasAnswered(false);
    setIsCorrect(null);
    setShowResult(false);
  }, [session.currentQuestionId]);

  // Fetch player's answer when results are shown (host finished question)
  useEffect(() => {
    const fetchPlayerAnswer = async () => {
      // When host finishes question (resultsView is set), fetch the player's answer
      if (session.resultsView && session.currentQuestionId) {
        const sessionId = (session as any).id || (session as any).sessionId;
        if (!sessionId) return;

        try {
          const response = await fetch(
            `/api/answers?sessionId=${sessionId}&questionId=${session.currentQuestionId}&playerId=${playerId}`
          );
          if (response.ok) {
            const data = await response.json();
            // API returns { answers: [...], distribution: {...} } when questionId is provided
            const answers = data.answers || (Array.isArray(data) ? data : []);
            // Find the player's answer
            const playerAnswer = answers.find((a: any) => a.userId === playerId);
            if (playerAnswer) {
              setIsCorrect(playerAnswer.isCorrect);
              setHasAnswered(true);
            } else {
              // Player didn't answer - mark as incorrect
              setIsCorrect(false);
              setHasAnswered(false);
            }
            // Show result screen now that we have the answer
            setShowResult(true);
          }
        } catch (error) {
          console.error('Error fetching player answer:', error);
          // On error, still show result screen (will show as incorrect)
          setShowResult(true);
        }
      } else {
        // Reset showResult when resultsView is cleared (new question started)
        setShowResult(false);
      }
    };

    fetchPlayerAnswer();
  }, [session.resultsView, session.currentQuestionId, playerId]);

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
      // Get question and option IDs, handling both id and questionId/optionId field names
      const questionId = (currentQuestion as any).id || (currentQuestion as any).questionId;
      
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          sessionId: session.id,
          questionId: questionId!,
          optionId: selectedAnswer || undefined,
          answerText: textAnswer || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit answer');
      }

      const answerData = await response.json();
      setHasAnswered(true);
      setIsCorrect(answerData.isCorrect);
      // Don't show result yet - wait for host to finish question
      // Just show "Answer submitted! Waiting for results..."
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
            id: p.id || p.userId,
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
    // Quiz is active but no question is set yet
    return (
      <Card variant="orange" className="text-center py-12">
        <h2 className="text-4xl font-black mb-4">
          {session.status === 'active' ? 'Waiting for question to start...' : 'Waiting for next question...'}
        </h2>
        <p className="text-xl font-bold opacity-90">
          The host will begin the question shortly.
        </p>
      </Card>
    );
  }

  const questionNumber = (session.quiz?.questions?.findIndex((q) => q.id === currentQuestion.id) || 0) + 1;
  const totalQuestions = session.quiz?.questions?.length || 0;

  // Show question when active (players don't see bar chart or ranking)
  return (
    <div className="space-y-6">
      <QuestionCard
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        question={currentQuestion.text}
        imageUrl={currentQuestion.imageUrl}
      >
        {currentQuestion.timeLimit && !session.resultsView && (
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

        {/* Show result screen only when host finishes question (resultsView is set) */}
        {showResult && session.resultsView ? (
          <Card 
            variant={isCorrect === true ? 'success' : isCorrect === false ? 'danger' : 'blue'} 
            className="text-center py-8"
          >
            {isCorrect === true ? (
              <>
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <p className="text-2xl font-black mb-2">
                  Correct!
                </p>
                <p className="text-lg font-bold opacity-90">
                  Great job! Waiting for next question...
                </p>
              </>
            ) : isCorrect === false ? (
              <>
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
                <p className="text-2xl font-black mb-2">
                  {hasAnswered ? 'Incorrect' : 'No Answer Submitted'}
                </p>
                <p className="text-lg font-bold opacity-90">
                  Better luck next time! Waiting for next question...
                </p>
              </>
            ) : (
              <>
                <LoadingSpinner size="md" />
                <p className="text-2xl font-black mt-4">
                  Loading results...
                </p>
                <p className="text-lg font-bold opacity-90 mt-2">
                  Please wait...
                </p>
              </>
            )}
          </Card>
        ) : hasAnswered ? (
          // Show "submitted" message while waiting for host to finish
          <Card variant="blue" className="text-center py-8">
            <LoadingSpinner size="md" />
            <p className="text-2xl font-black mt-4">
              Answer submitted!
            </p>
            <p className="text-lg font-bold opacity-90 mt-2">
              Waiting for results...
            </p>
          </Card>
        ) : (
          <>
            {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') &&
              currentQuestion.options && (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, idx) => {
                    const optionId = (option as any).id || (option as any).optionId;
                    return (
                      <EmojiOptionButton
                        key={idx}
                        emoji={getEmojiForOption(idx)}
                        isSelected={selectedAnswer === optionId}
                        onClick={() => setSelectedAnswer(optionId || null)}
                        colorIndex={idx}
                      />
                    );
                  })}
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
            id: p.id || p.userId,
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
