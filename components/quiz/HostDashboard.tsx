'use client';

import { useEffect, useState, useRef } from 'react';
import type { QuizSession, Question } from '@/lib/types';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { ParticipantList } from '@/components/ui/ParticipantList';
import { HostControls } from '@/components/ui/HostControls';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Timer } from '@/components/ui/Timer';
import { QuestionResultsBarChart } from './QuestionResultsBarChart';
import { QuestionResultsRanking } from './QuestionResultsRanking';
import { updateSessionQuestion, startSession, endSession, showBarChart, showRanking, hideResults, kickParticipant } from '@/app/(app)/actions/session';
import { getErrorMessage } from '@/lib/types/errors';
import { useToast } from '@/lib/hooks/useToast';
import { getEmojiForOption } from '@/lib/utils/emoji-assignment';

interface AnswerWithParticipant {
  answerId: string | number;
  sessionId: string | number;
  questionId: string | number;
  userId: string;
  answerText: string | null;
  optionId: string | null;
  isCorrect: boolean;
  answeredAt: Date;
  participant: {
    userName: string | null;
    userId: string;
  };
}

interface AnswerData {
  answers: AnswerWithParticipant[];
  distribution: Record<string, number>; // Changed from number to string (optionId is string)
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
  const hasAutoFinishedRef = useRef<string | null>(null);
  const questionStartTimeRef = useRef<number | null>(null);

  const handleStart = async () => {
    try {
      await startSession(session.code);
      // Don't auto-set first question - let host control when to start
      onUpdate();
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'Failed to start session', 'error');
    }
  };

  const handleStartQuestion = async (questionIndex?: number) => {
    try {
      // Get questions directly from session to avoid stale closure
      const sessionQuestions = session.quiz?.questions || [];
      
      // Check if quiz and questions are loaded
      if (!session.quiz) {
        showToast('Quiz data not loaded. Please refresh the page.', 'error');
        return;
      }

      if (!sessionQuestions || sessionQuestions.length === 0) {
        showToast('No questions found in quiz. Please check the quiz has questions.', 'error');
        return;
      }

      // If no index provided, start with first question (index 0)
      const targetIndex = questionIndex ?? 0;
      
      if (targetIndex >= 0 && targetIndex < sessionQuestions.length) {
        // Handle both id and questionId field names, and also check for questionId from Drizzle
        const question = sessionQuestions[targetIndex];
        // Try multiple possible field names
        const questionId = (question as any).id 
          || (question as any).questionId 
          || (question as any).question_id;
        
        if (questionId) {
          await updateSessionQuestion(session.code, String(questionId));
          setCurrentQuestionIndex(targetIndex);
          setAnswers(null); // Reset answers for new question
          onUpdate();
        } else {
          // Debug: log the question object to see what fields it has
          console.error('Question object:', question);
          console.error('Question keys:', Object.keys(question || {}));
          console.error('Questions array:', sessionQuestions);
          console.error('Session quiz:', session.quiz);
          showToast('Question ID not found. Check console for details.', 'error');
        }
      } else {
        showToast(`Invalid question index. Available: ${sessionQuestions.length}, Requested: ${targetIndex}`, 'error');
      }
    } catch (error: unknown) {
      console.error('Error starting question:', error);
      showToast(getErrorMessage(error) || 'Failed to start question', 'error');
    }
  };

  const handleFinishQuestion = async () => {
    try {
      // Save results to database first
      const sessionId = (session as any).id || (session as any).sessionId;
      if (sessionId && session.currentQuestionId) {
        await fetch(`/api/sessions/${session.code}/results`, {
          method: 'POST',
        });
      }
      // Show bar chart
      await showBarChart(session.code);
      onUpdate();
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'Failed to finish question', 'error');
    }
  };

  const handleShowRanking = async () => {
    try {
      await showRanking(session.code);
      onUpdate();
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'Failed to show ranking', 'error');
    }
  };

  const handleBackToChart = async () => {
    try {
      await showBarChart(session.code);
      onUpdate();
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'Failed to go back to chart', 'error');
    }
  };

  const handleNext = async () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      try {
        await hideResults(session.code);
        // Handle both id and questionId field names
        const question = questions[nextIndex];
        const questionId = (question as any).id || (question as any).questionId;
        
        if (questionId) {
          await updateSessionQuestion(session.code, questionId);
          setCurrentQuestionIndex(nextIndex);
          setAnswers(null); // Reset answers for new question
          onUpdate();
        } else {
          showToast('Question ID not found', 'error');
        }
      } catch (error: unknown) {
        showToast(getErrorMessage(error) || 'Failed to update question', 'error');
      }
    } else {
      handleEnd();
    }
  };

  const handleTimerComplete = async () => {
    // Auto-show bar chart when timer hits 0
    if (session.status === 'active' && !session.resultsView) {
      await handleFinishQuestion();
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

  const handleKickParticipant = async (userId: string) => {
    try {
      await kickParticipant(session.code, userId);
      showToast('Player kicked successfully', 'success');
      onUpdate();
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'Failed to kick player', 'error');
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
        // Convert distribution keys from number to string if needed
        const distribution: Record<string, number> = {};
        if (data.distribution) {
          Object.keys(data.distribution).forEach(key => {
            distribution[key] = data.distribution[key];
          });
        }
        setAnswers({
          ...data,
          distribution,
        });
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  useEffect(() => {
    // Sync currentQuestionIndex with session.currentQuestionId
    // Handle both id and questionId field names for compatibility
    if (session.currentQuestionId) {
      const index = questions.findIndex((q) => {
        const qId = (q as any).id || (q as any).questionId;
        return qId === session.currentQuestionId;
      });
      if (index >= 0) {
        setCurrentQuestionIndex(index);
      } else {
        // If not found, reset to -1
        setCurrentQuestionIndex(-1);
      }
    } else {
      setCurrentQuestionIndex(-1);
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

  // Reset auto-finish tracking when question changes
  useEffect(() => {
    hasAutoFinishedRef.current = null;
    // Record when the question started (to prevent immediate auto-finish)
    questionStartTimeRef.current = Date.now();
  }, [session.currentQuestionId]);

  // Auto-finish question when all participants have answered
  useEffect(() => {
    const sessionId = (session as any).id || (session as any).sessionId;
    const participantCount = session.participants?.length || 0;
    const answerCount = answers?.answers.length || 0;
    const questionId = session.currentQuestionId;
    const questionStartTime = questionStartTimeRef.current;
    
    // Only auto-finish if:
    // 1. Session is active
    // 2. Question is active (not showing results)
    // 3. There are participants (must be at least 1)
    // 4. We have answers data (answers object exists)
    // 5. All participants have answered (answerCount >= participantCount)
    // 6. We have a valid session ID
    // 7. We have a current question ID
    // 8. We haven't already auto-finished this question
    // 9. Current question index is valid (question is displayed)
    // 10. Question has been displayed for at least 1 second (prevents immediate auto-finish)
    const timeSinceQuestionStart = questionStartTime ? Date.now() - questionStartTime : Infinity;
    const minDisplayTime = 1000; // 1 second minimum
    
    if (
      session.status === 'active' &&
      !session.resultsView &&
      participantCount > 0 &&
      answers !== null &&
      answerCount > 0 &&
      answerCount >= participantCount &&
      sessionId &&
      questionId &&
      currentQuestionIndex >= 0 &&
      hasAutoFinishedRef.current !== questionId &&
      timeSinceQuestionStart >= minDisplayTime
    ) {
      // Mark this question as auto-finished to prevent multiple calls
      hasAutoFinishedRef.current = questionId;
      
      // Small delay to avoid race conditions with answer fetching
      const timeoutId = setTimeout(async () => {
        try {
          // Save results to database first
          if (sessionId && questionId) {
            await fetch(`/api/sessions/${session.code}/results`, {
              method: 'POST',
            });
          }
          // Show bar chart
          await showBarChart(session.code);
          onUpdate();
        } catch (error: unknown) {
          showToast(getErrorMessage(error) || 'Failed to finish question', 'error');
          // Reset the ref on error so it can retry
          hasAutoFinishedRef.current = null;
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [answers, session.status, session.resultsView, session.participants, session.currentQuestionId, session.code, currentQuestionIndex, onUpdate, showToast]);

  // Find current question by ID if index lookup fails
  const currentQuestion = currentQuestionIndex >= 0 
    ? questions[currentQuestionIndex] 
    : session.currentQuestionId
      ? questions.find((q) => {
          const qId = (q as any).id || (q as any).questionId;
          return qId === session.currentQuestionId;
        }) || null
      : null;

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

        {session.status === 'active' && !session.currentQuestionId && !session.resultsView && (
          <Card variant="blue" className="text-center py-12">
            <h2 className="text-4xl font-black mb-4">
              Quiz Started!
            </h2>
            <p className="text-xl font-bold mb-6">
              Click "Start Question" to begin the first question
            </p>
            {questions.length > 0 ? (
              <Badge variant="info" size="lg">
                {questions.length} {questions.length === 1 ? 'question' : 'questions'} ready
              </Badge>
            ) : (
              <Badge variant="warning" size="lg">
                No questions loaded. Please refresh.
              </Badge>
            )}
          </Card>
        )}

        {session.status === 'active' && currentQuestion && !session.resultsView && session.currentQuestionId && (
          <>
            <QuestionCard
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              question={currentQuestion.text}
              imageUrl={currentQuestion.imageUrl}
              colorIndex={currentQuestionIndex}
            >
              {currentQuestion.timeLimit && (
                <div className="mb-4">
                  <Timer
                    initialSeconds={currentQuestion.timeLimit}
                    onComplete={handleTimerComplete}
                    variant="linear"
                  />
                </div>
              )}
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    // Handle both id and optionId field names
                    const optionId = (option as any).id || (option as any).optionId || '';
                    const count = answers?.distribution[optionId] || 0;
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
                    // Handle both id and optionId field names when matching
                    const optionIndex = currentQuestion?.options?.findIndex(
                      (opt) => {
                        const optId = (opt as any).id || (opt as any).optionId;
                        return optId === answer.optionId;
                      }
                    ) ?? -1;
                    const emoji = optionIndex >= 0 ? getEmojiForOption(optionIndex) : '❓';
                    const optionText = currentQuestion?.options?.find(
                      (opt) => {
                        const optId = (opt as any).id || (opt as any).optionId;
                        return optId === answer.optionId;
                      }
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

        {session.status === 'active' && currentQuestion && session.resultsView === 'barChart' && answers && (
          <>
            <QuestionResultsBarChart
              question={currentQuestion}
              answerDistribution={answers.distribution}
              totalAnswers={answers.answers.length}
            />
            <div className="flex justify-center gap-4">
              <Button onClick={handleShowRanking} variant="primary" size="lg">
                Show Ranking
              </Button>
            </div>
          </>
        )}

        {session.status === 'active' && session.resultsView === 'ranking' && (
          <>
            <QuestionResultsRanking
              participants={session.participants || []}
            />
            <div className="flex flex-col items-center gap-4 w-full">
              <Button onClick={handleBackToChart} variant="secondary" size="lg" className="w-full">
                Back to Chart
              </Button>
              <Button onClick={handleNext} variant="primary" size="lg" className="w-full">
                Next Question
              </Button>
            </div>
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
          onNext={session.resultsView === 'ranking' ? handleNext : handleFinishQuestion}
          onEnd={handleEnd}
          onStartQuestion={() => handleStartQuestion()}
          isActive={session.status === 'active'}
          participantCount={session.participants?.length || 0}
          canGoNext={currentQuestionIndex < questions.length - 1}
          showFinishQuestion={session.status === 'active' && !session.resultsView}
          showStartQuestion={session.status === 'active' && !session.currentQuestionId && !session.resultsView}
        />

        {session.participants && session.participants.length > 0 && (
          <ParticipantList
            participants={session.participants.map(p => ({
              id: p.id || p.userId,
              userId: p.userId,
              userName: p.userName,
              score: p.score,
            }))}
            onKick={handleKickParticipant}
            isHost={true}
          />
        )}
      </div>
    </div>
  );
}
