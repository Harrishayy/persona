'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { Gamepad2 } from 'lucide-react';
import type { Quiz, Round, Question } from '@/lib/types/app';
import { GAME_MODES } from '@/lib/utils/game-modes';
import { ALL_VARIANTS } from '@/lib/utils/colors';
import type { ColorVariant } from '@/lib/utils/colors';

interface QuizPreviewProps {
  quiz: {
    title: string;
    description?: string;
    imageUrl?: string;
    emoji?: string;
    gameMode?: string;
    rounds?: Round[];
    questions?: Question[];
  };
  activeQuestionIndex?: number | null;
}

export function QuizPreview({ quiz, activeQuestionIndex }: QuizPreviewProps) {
  const gameMode = quiz.gameMode ? GAME_MODES[quiz.gameMode as keyof typeof GAME_MODES] : null;
  
  // Get the active question if available
  const activeQuestion = activeQuestionIndex !== null && activeQuestionIndex !== undefined 
    ? quiz.questions?.[activeQuestionIndex]
    : null;

  // If there's an active question, show Kahoot-style preview
  if (activeQuestion && activeQuestionIndex !== null && activeQuestionIndex !== undefined) {
    const colorIndex = activeQuestionIndex;
    const variant = (ALL_VARIANTS[colorIndex % ALL_VARIANTS.length] || 'purple') as ColorVariant;
    
    return (
      <div className="space-y-6">
        <QuestionCard
          questionNumber={activeQuestionIndex + 1}
          totalQuestions={quiz.questions?.length}
          question={activeQuestion.text || `Question ${activeQuestionIndex + 1}`}
          imageUrl={activeQuestion.imageUrl || undefined}
          colorIndex={colorIndex}
        >
          {activeQuestion.type === 'multiple_choice' && activeQuestion.options && (
            <div className="space-y-3">
              {activeQuestion.options.map((option, idx) => {
                const optionColor = (ALL_VARIANTS[idx % ALL_VARIANTS.length] || 'purple') as ColorVariant;
                return (
                  <Card key={idx} variant={optionColor} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-lg">{option.text}</span>
                      {option.isCorrect && (
                        <Badge variant="success" size="sm">Correct</Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          {activeQuestion.type === 'true_false' && activeQuestion.options && (
            <div className="space-y-3">
              {activeQuestion.options.map((option, idx) => {
                const optionColor = (ALL_VARIANTS[idx % ALL_VARIANTS.length] || 'purple') as ColorVariant;
                return (
                  <Card key={idx} variant={optionColor} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-lg">{option.text}</span>
                      {option.isCorrect && (
                        <Badge variant="success" size="sm">Correct</Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          {activeQuestion.type === 'text_input' && (
            <Card variant="blue" className="p-4 text-center">
              <p className="font-bold text-lg">Text Input Question</p>
              <p className="text-sm opacity-80 mt-2">Players will type their answer</p>
            </Card>
          )}
          {activeQuestion.type === 'image' && (
            <Card variant="yellow" className="p-4 text-center">
              <p className="font-bold text-lg">Image Question</p>
              {activeQuestion.imageUrl && (
                <img
                  src={activeQuestion.imageUrl}
                  alt="Question"
                  className="w-full max-h-64 object-cover mt-4 border-4 border-[#1F2937] rounded-lg"
                />
              )}
            </Card>
          )}
        </QuestionCard>
      </div>
    );
  }

  // Default: Show quiz header when no question is active
  return (
    <div className="space-y-6">
      {/* Quiz Header Preview */}
      <Card variant="green" className="text-center">
        <div className="mb-4">
          {quiz.emoji && (
            <div className="text-6xl mb-4">{quiz.emoji}</div>
          )}
          {quiz.imageUrl && !quiz.emoji && (
            <img
              src={quiz.imageUrl}
              alt={quiz.title}
              className="w-32 h-32 object-cover mx-auto mb-4 border-4 border-[#1F2937] rounded-lg"
            />
          )}
          {!quiz.emoji && !quiz.imageUrl && (
            <Gamepad2 className="w-32 h-32 mx-auto mb-4 text-[#1F2937]" />
          )}
        </div>
        <h1 className="text-4xl font-black text-[#1F2937] mb-2">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-lg font-bold text-[#1F2937] opacity-90">{quiz.description}</p>
        )}
        {gameMode && (
          <Badge variant={gameMode.color as any} className="mt-4">
            {gameMode.name}
          </Badge>
        )}
      </Card>

      {/* Rounds Preview */}
      {quiz.rounds && quiz.rounds.length > 0 && (
        <div className="space-y-4">
          {quiz.rounds.map((round, roundIndex) => {
            const roundGameMode = GAME_MODES[round.gameMode as keyof typeof GAME_MODES];
            const roundQuestions = quiz.questions?.filter(q => q.roundId === round.id) || [];

            return (
              <Card key={roundIndex} variant="pink" className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-black text-[#1F2937]">
                    {round.title || `Round ${roundIndex + 1}`}
                  </h2>
                  <Badge variant={roundGameMode.color as any}>
                    {roundGameMode.name}
                  </Badge>
                </div>
                {round.description && (
                  <p className="text-base font-bold text-[#1F2937] opacity-90 mb-4">
                    {round.description}
                  </p>
                )}
                <div className="space-y-2">
                  {roundQuestions.map((question, qIndex) => (
                    <div
                      key={qIndex}
                      className="p-3 border-2 border-[#1F2937] rounded-lg bg-white"
                    >
                      <p className="font-bold text-[#1F2937]">
                        {question.text || `Question ${qIndex + 1}`}
                      </p>
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {question.options.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className="text-sm font-bold text-[#6B7280] pl-4"
                            >
                              • {opt.text}
                              {opt.isCorrect && (
                                <span className="ml-2 text-[#86EFAC]">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Questions without rounds */}
      {quiz.questions && (!quiz.rounds || quiz.rounds.length === 0) && (
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-[#1F2937]">Questions</h2>
          {quiz.questions.map((question, index) => (
            <Card key={index} variant="cyan" className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex items-center justify-center border-4 border-[#1F2937] rounded-lg bg-white font-black text-[#1F2937] flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-black text-[#1F2937] mb-2">
                    {question.text || `Question ${index + 1}`}
                  </p>
                  {question.options && question.options.length > 0 && (
                    <div className="space-y-1">
                      {question.options.map((opt, optIndex) => (
                        <div
                          key={optIndex}
                          className="text-sm font-bold text-[#6B7280] pl-4"
                        >
                          • {opt.text}
                          {opt.isCorrect && (
                            <span className="ml-2 text-[#86EFAC]">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
