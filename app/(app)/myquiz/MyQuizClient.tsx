'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { Edit, Trash2, Eye, Play, Gamepad2 } from 'lucide-react';
import { getDeterministicColors, hexColorsToVariants, ALL_VARIANTS, type ColorVariant } from '@/lib/utils/colors';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { QuizPreviewModal } from '@/components/quiz/QuizPreviewModal';
import { useQuizPreview } from '@/lib/hooks/useQuizPreview';
import { createSession } from '@/app/(app)/actions/session';
import { deleteQuiz } from '@/app/(app)/actions/quiz';
import { getErrorMessage } from '@/lib/types/errors';

interface Quiz {
  quizId: string;
  title: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  emoji?: string;
}

interface MyQuizClientProps {
  initialQuizzes: Quiz[];
}

export function MyQuizClient({ initialQuizzes }: MyQuizClientProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const {
    previewModalOpen,
    previewQuestions,
    previewQuizTitle,
    isLoadingPreview,
    openPreview,
    closePreview,
  } = useQuizPreview();
  const router = useRouter();
  const { showToast } = useToast();
  
  // Use deterministic color assignment based on quiz IDs to prevent hydration mismatches
  const getVariantForQuiz = (quiz: Quiz, index: number): ColorVariant => {
    // Use quiz ID as seed for deterministic color assignment
    const seed = `quiz-${quiz.quizId}`;
    const colors = getDeterministicColors(seed, 1);
    const variant = hexColorsToVariants(colors)[0];
    return variant || ALL_VARIANTS[index % ALL_VARIANTS.length];
  };

  const handleDelete = async (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;

    try {
      await deleteQuiz(quizToDelete);
      setQuizzes(quizzes.filter(q => q.quizId !== quizToDelete));
      showToast('Quiz deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      const errorMessage = getErrorMessage(error) || 'Failed to delete quiz';
      showToast(errorMessage, 'error');
    } finally {
      setDeleteModalOpen(false);
      setQuizToDelete(null);
    }
  };



  const handleHost = async (quizId: string) => {
    try {
      const result = await createSession(quizId);
      router.push(`/host/${result.code}`);
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'Failed to create session', 'error');
    }
  };

  const handleEdit = (quizId: string) => {
    router.push(`/create?quizId=${quizId}`);
  };

  const handlePreview = async (quizId: string, quizTitle: string) => {
    await openPreview(quizId, quizTitle);
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
        onClose={closePreview}
        questions={previewQuestions}
        quizTitle={previewQuizTitle}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz, index) => {
        const variant = getVariantForQuiz(quiz, index);
        const isPublished = quiz.status === 'published';
        
        return (
          <Card key={quiz.quizId} variant={variant} className="flex flex-col">
            <div className="flex gap-3 mb-2">
              {/* Small image/emoji on the side */}
              {(quiz.imageUrl || quiz.emoji) && (
                <div className="flex-shrink-0">
                  {quiz.emoji ? (
                    <div className="text-3xl w-16 h-16 flex items-center justify-center border-4 border-[#1F2937] rounded-lg bg-white">
                      {quiz.emoji}
                    </div>
                  ) : quiz.imageUrl ? (
                    <img
                      src={quiz.imageUrl}
                      alt={quiz.title}
                      className="w-16 h-16 object-cover border-4 border-[#1F2937] rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>
              )}
              
              {/* Title and status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-black flex-1">{quiz.title}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${
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
              </div>
            </div>

            <div className="mt-auto pt-4 space-y-2">
              <Button 
                color={variant} 
                className="w-full" 
                size="md"
                type="button"
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
                  type="button"
                  onClick={() => handleDelete(quiz.quizId)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="md"
                  type="button"
                  onClick={() => handlePreview(quiz.quizId.toString(), quiz.title)}
                  disabled={isLoadingPreview}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>
              <Button
                color={variant}
                className="w-full"
                size="md"
                type="button"
                onClick={() => handleEdit(quiz.quizId)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </Card>
        );
      })}
      </div>
    </>
  );
}
