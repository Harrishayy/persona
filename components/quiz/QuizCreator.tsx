'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, QuizTemplate } from '@/lib/types/app';
import type { GameMode, DatabaseQuiz } from '@/lib/types/database';
import { Button } from '@/components/ui/Button';
import { QuizHeader } from './QuizHeader';
import { ViewModeToggle } from './ViewModeToggle';
import { QuestionList } from './QuestionList';
import { PreviewPanel } from './PreviewPanel';
import { createQuiz, updateQuiz } from '@/app/(app)/actions/quiz';
import { getErrorMessage } from '@/lib/types/errors';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/lib/hooks/useToast';
import { convertQuestion } from '@/lib/types/converters';

interface QuizCreatorProps {
  initialTemplate?: QuizTemplate | null;
  initialQuiz?: DatabaseQuiz | null;
}

export function QuizCreator({ initialTemplate, initialQuiz }: QuizCreatorProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = !!initialQuiz;

  // Quiz metadata
  const [title, setTitle] = useState(
    initialQuiz?.title || initialTemplate?.name || ''
  );
  const [description, setDescription] = useState(
    initialQuiz?.description || initialTemplate?.description || ''
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    initialQuiz?.imageUrl || undefined
  );
  const [emoji, setEmoji] = useState<string | undefined>(
    initialQuiz?.emoji || undefined
  );
  const [isPublic, setIsPublic] = useState(initialQuiz?.isPublic || false);
  const [gameMode, setGameMode] = useState<GameMode>(
    (initialQuiz?.gameMode as GameMode) || 'standard'
  );

  // Questions
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (initialQuiz?.questions && initialQuiz.questions.length > 0) {
      return initialQuiz.questions.map(convertQuestion);
    }
    if (initialTemplate?.questions && initialTemplate.questions.length > 0) {
      return initialTemplate.questions;
    }
    return [
      {
        type: 'multiple_choice' as const,
        text: '',
        order: 0,
        options: [
          { text: '', isCorrect: false, order: 0 },
          { text: '', isCorrect: false, order: 1 },
        ],
      },
    ];
  });

  // UI state
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(0);


  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: 'multiple_choice',
        text: '',
        order: questions.length,
        options: [
          { text: '', isCorrect: false, order: 0 },
          { text: '', isCorrect: false, order: 1 },
        ],
      },
    ]);
  };

  const updateQuestion = (index: number, question: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...question, order: index };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i })));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('Please enter a quiz title', 'warning');
      return;
    }

    if (questions.length === 0) {
      showToast('Please add at least one question', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && initialQuiz) {
        // Database returns quizId, not id
        const quizId = (initialQuiz as any).quizId || (initialQuiz as any).id;
        if (!quizId) {
          showToast('Invalid quiz data', 'error');
          return;
        }
        const result = await updateQuiz(quizId, {
          title,
          description,
          imageUrl,
          emoji,
          isPublic,
          gameMode,
          questions: questions.map((q, i) => ({
            ...q,
            order: i,
          })),
        });
        showToast('Quiz updated successfully', 'success');
        router.push(`/host/${result.code}`);
      } else {
        const result = await createQuiz({
          title,
          description,
          imageUrl,
          emoji,
          isPublic,
          gameMode,
          questions: questions.map((q, i) => ({
            ...q,
            order: i,
          })),
        });
        showToast('Quiz created successfully', 'success');
        router.push(`/host/${result.code}`);
      }
    } catch (error: unknown) {
      showToast(
        getErrorMessage(error) || 
        (isEditing ? 'Failed to update quiz' : 'Failed to create quiz'),
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewQuiz = {
    title,
    description,
    imageUrl,
    emoji,
    gameMode,
    questions,
  };

  return (
    <div className={cn(
      'space-y-6',
      isDetailedView ? 'max-w-[95vw] mx-auto px-4' : 'max-w-4xl mx-auto'
    )}>
      {/* View Mode Toggle */}
      <ViewModeToggle isDetailed={isDetailedView} onToggle={setIsDetailedView} />

      <div className={cn('space-y-6', isDetailedView && 'grid grid-cols-2 gap-6 items-start')}>
        {/* Left Column - Editor */}
        <div className={cn(
          isDetailedView && 'overflow-y-auto max-h-[calc(100vh-200px)]'
        )}>
          <div className={cn(
            'space-y-6',
            isDetailedView && 'p-4 rounded-lg bg-[#F3F4F6]'
          )}>
            <QuizHeader
              title={title}
              description={description}
              imageUrl={imageUrl}
              emoji={emoji}
              isPublic={isPublic}
              gameMode={gameMode}
              hasRounds={false}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onImageUrlChange={setImageUrl}
              onEmojiChange={setEmoji}
              onPublicChange={setIsPublic}
              onGameModeChange={setGameMode}
            />

            <QuestionList
              questions={questions}
              onQuestionsChange={setQuestions}
              onAddQuestion={addQuestion}
              onUpdateQuestion={updateQuestion}
              onDeleteQuestion={deleteQuestion}
              onActiveQuestionChange={setActiveQuestionIndex}
            />

            <div className="flex justify-end gap-4 pb-8">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                size="lg"
              >
                {isEditing ? 'Update Quiz' : 'Create Quiz'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Preview (only in detailed view) */}
        {isDetailedView && (
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <PreviewPanel 
              quiz={previewQuiz} 
              activeQuestionIndex={activeQuestionIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
}
