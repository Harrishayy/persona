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
import { useToast } from '@/lib/hooks/useToast';
import { getEmojiForOption } from '@/lib/utils/emoji-assignment';

interface AnswerWithParticipant {
  answerId: number;
  sessionId: number;
  questionId: number;
  userId: string;
  answerText: string | null;
  optionId: number | null;
  isCorrect: boolean;
  answeredAt: Date;
  participant: {
    userName: string | null;
    userId: string;
  };
}

interface AnswerData {
  answers: AnswerWithParticipant[];
  distribution: Record<number, number>;
}

interface HostDashboardProps {
  session: QuizSession;
  onUpdate: () => void;
}

export function HostDashboard({ session, onUpdate }: HostDashboardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<AnswerData | null>(null);
  const questions = session.quiz?.questions || [];
  const { showToast } = useToast();

  const handleStart = async () => {
    try {
      await startSession(session.code);
      setCurrentQuestionIndex(0);
      onUpdate();
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'Failed to start session', 'error');
    }
  };

  const handleNext = async () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      try {
        await updateSessionQuestion(session.code, questions[nextIndex].id!);
        setCurrentQuestionIndex(nextIndex);
        setAnswers(null); // Reset answers for new question
        onUpdate();
      } catch (error: unknown) {
        showToast(getErrorMessage(error) || 'Failed to update question', 'error');
      }
    } else {
      handleEnd();
    }
  };

  const handleEnd = async () => {
    try {
      await endSession(session.code);
      setAnswers(null);
      onUpdate();
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'Failed to end session', 'error');
    }
  };

  const fetchAnswers = async () => {
    // Handle both id and sessionId field names
    const sessionId = (session as any).id || (session as any).sessionId;
    if (!sessionId || !session.currentQuestionId) return;

    try {
      const response = await fetch(
        `/api/answers?sessionId=${sessionId}&questionId=${session.currentQuestionId}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnswers(data);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  useEffect(() => {
    // Sync currentQuestionIndex with session.currentQuestionId
    if (session.currentQuestionId) {
      const index = questions.findIndex((q) => q.id === session.currentQuestionId);
      if (index >= 0) {
        setCurrentQuestionIndex(index);
      }
    }
  }, [session.currentQuestionId, questions]);

  useEffect(() => {
    // Poll for answers when question is active
    const sessionId = (session as any).id || (session as any).sessionId;
    if (session.status === 'active' && session.currentQuestionId && sessionId) {
      fetchAnswers();
      const interval = setInterval(fetchAnswers, 2000);
      return () => clearInterval(interval);
    } else {
      setAnswers(null);
    }
  }, [session.status, session.currentQuestionId]);

  const currentQuestion = currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {session.status === 'waiting' && (
          <Card variant="yellow" className="text-center py-12">
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
          <>
            <QuestionCard
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              question={currentQuestion.text}
              imageUrl={currentQuestion.imageUrl}
              colorIndex={currentQuestionIndex}
            >
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const count = answers?.distribution[option.id || -1] || 0;
                    return (
                      <div
                        key={idx}
                        className="p-4 border-4 border-[#1F2937] bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getEmojiForOption(idx)}</span>
                            <span className="font-medium">{option.text}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {count > 0 && (
                              <Badge variant="info" size="sm">
                                {count} {count === 1 ? 'answer' : 'answers'}
                              </Badge>
                            )}
                            {option.isCorrect && (
                              <Badge variant="success" size="sm">Correct</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </QuestionCard>

            {answers && answers.answers.length > 0 && (
              <Card variant="blue" className="p-6">
                <h3 className="text-2xl font-black mb-4">Player Answers</h3>
                <div className="space-y-2">
                  {answers.answers.map((answer) => {
                    const optionIndex = currentQuestion?.options?.findIndex(
                      (opt) => opt.id === answer.optionId
                    ) ?? -1;
                    const emoji = optionIndex >= 0 ? getEmojiForOption(optionIndex) : '❓';
                    const optionText = currentQuestion?.options?.find(
                      (opt) => opt.id === answer.optionId
                    )?.text || answer.answerText || 'Unknown';

                    return (
                      <div
                        key={answer.answerId}
                        className="flex items-center justify-between p-3 border-2 border-[#1F2937] bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{emoji}</span>
                          <span className="font-bold">
                            {answer.participant.userName || answer.participant.userId}
                          </span>
                          <span className="text-sm opacity-75">answered</span>
                          <span className="font-medium">{optionText}</span>
                        </div>
                        {answer.isCorrect && (
                          <Badge variant="success" size="sm">✓</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </>
        )}

        {session.status === 'finished' && (
          <Card variant="green" className="text-center py-12">
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
