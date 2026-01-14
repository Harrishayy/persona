'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { Edit, Trash2, Eye, Play, Gamepad2 } from 'lucide-react';
import { getDeterministicColors, hexColorsToVariants, ALL_VARIANTS } from '@/lib/utils/colors';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { QuizPreviewModal } from '@/components/quiz/QuizPreviewModal';
import type { Question } from '@/lib/types/app';
import { convertQuestion } from '@/lib/types/converters';
import { createSession } from '@/app/(app)/actions/session';
import { getErrorMessage } from '@/lib/types/errors';

interface Quiz {
  quizId: number;
  title: string;
  description?: string;
  code: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MyQuizClientProps {
  initialQuizzes: Quiz[];
}

export function MyQuizClient({ initialQuizzes }: MyQuizClientProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [previewQuizTitle, setPreviewQuizTitle] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  
  // Use deterministic color assignment based on quiz IDs to prevent hydration mismatches
  const getVariantForQuiz = (quiz: Quiz, index: number): ColorVariant => {
    // Use quiz ID as seed for deterministic color assignment
    const seed = `quiz-${quiz.quizId}-${quiz.code}`;
    const colors = getDeterministicColors(seed, 1);
    const variant = hexColorsToVariants(colors)[0];
    return variant || ALL_VARIANTS[index % ALL_VARIANTS.length];
  };

  const handleDelete = async (quizId: number) => {
    setQuizToDelete(quizId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;

    try {
      const response = await fetch(`/api/quizzes/${quizToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuizzes(quizzes.filter(q => q.quizId !== quizToDelete));
        showToast('Quiz deleted successfully', 'success');
      } else {
        showToast('Failed to delete quiz', 'error');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      showToast('Error deleting quiz', 'error');
    } finally {
      setDeleteModalOpen(false);
      setQuizToDelete(null);
    }
  };

  const handlePublish = async (quizId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setQuizzes(quizzes.map(q => 
          q.quizId === quizId ? { ...q, status: newStatus } : q
        ));
        router.refresh();
      } else {
        showToast('Failed to update quiz status', 'error');
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      showToast('Error updating quiz', 'error');
    }
  };

  const handleHost = async (quizId: number) => {
    try {
      const result = await createSession(quizId);
      router.push(`/host/${result.code}`);
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'Failed to create session', 'error');
    }
  };

  const handlePreview = async (quizId: number, quizTitle: string) => {
    setIsLoadingPreview(true);
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      if (!response.ok) {
        let errorMessage = 'Failed to load quiz';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Failed to load quiz (${response.status})`;
        }
        throw new Error(errorMessage);
      }
      const quiz = await response.json();
      
      // Convert questions from database format to app format
      // Handle both questionId (from Drizzle) and id (from type definition)
      const questions = (quiz.questions || []).map((q: any) => {
        try {
          // Map Drizzle field names to DatabaseQuestion type
          const dbQuestion = {
            id: q.questionId || q.id,
            quizId: q.quizId,
            roundId: q.roundId ?? null,
            type: q.type,
            text: q.text,
            imageUrl: q.imageUrl ?? null,
            order: q.order,
            timeLimit: q.timeLimit ?? null,
            createdAt: q.createdAt || new Date(),
            options: q.options?.map((opt: any) => ({
              id: opt.optionId || opt.id,
              questionId: opt.questionId,
              text: opt.text,
              isCorrect: opt.isCorrect,
              order: opt.order,
              createdAt: opt.createdAt || new Date(),
            })),
          };
          return convertQuestion(dbQuestion);
        } catch (err) {
          console.error('Error converting question:', err, q);
          // Return a basic question structure if conversion fails
          return {
            type: q.type || 'multiple_choice',
            text: q.text || '',
            order: q.order || 0,
            imageUrl: q.imageUrl || undefined,
            timeLimit: q.timeLimit || undefined,
            options: q.options?.map((opt: any) => ({
              text: opt.text || '',
              isCorrect: opt.isCorrect || false,
              order: opt.order || 0,
            })) || [],
          };
        }
      });
      
      setPreviewQuestions(questions);
      setPreviewQuizTitle(quizTitle);
      setPreviewModalOpen(true);
    } catch (error) {
      console.error('Error loading quiz for preview:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load quiz for preview';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  if (quizzes.length === 0) {
    return (
      <Card variant="yellow" className="text-center py-12">
        <Gamepad2 className="w-20 h-20 mx-auto mb-6 opacity-60" />
        <h2 className="text-3xl font-black mb-4">No quizzes yet</h2>
        <p className="text-lg font-bold opacity-90 mb-8">
          Create your first quiz to get started!
        </p>
        <Link href="/create">
          <Button variant="primary" size="lg">
            Create Quiz
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <>
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setQuizToDelete(null);
        }}
        title="Delete Quiz"
        color="red"
      >
        <div className="space-y-4">
          <p className="text-lg font-bold">Are you sure you want to delete this quiz? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setQuizToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <QuizPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        questions={previewQuestions}
        quizTitle={previewQuizTitle}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz, index) => {
        const variant = getVariantForQuiz(quiz, index);
        const isPublished = quiz.status === 'published';
        
        return (
          <Card key={quiz.quizId} variant={variant} className="flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-2xl font-black flex-1">{quiz.title}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                isPublished 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {quiz.status}
              </span>
            </div>
            
            {quiz.description && (
              <p className="text-base font-bold opacity-90 mb-4 flex-grow">
                {quiz.description}
              </p>
            )}
            
            <div className="text-sm font-bold opacity-80 mb-4">
              Code: <span className="font-black">{quiz.code}</span>
            </div>

            <div className="mt-auto pt-4 space-y-2">
              <Button 
                color={variant} 
                className="w-full" 
                size="md"
                onClick={() => handleHost(quiz.quizId)}
              >
                <Play className="w-4 h-4 mr-1" />
                Host
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  size="md"
                  onClick={() => handleDelete(quiz.quizId)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="md"
                  onClick={() => handlePreview(quiz.quizId, quiz.title)}
                  disabled={isLoadingPreview}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>
              <Link href={`/create?quizId=${quiz.quizId}`}>
                <Button
                  color={variant}
                  className="w-full"
                  size="md"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </Link>
            </div>
          </Card>
        );
      })}
      </div>
    </>
  );
}
