'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Gamepad2, Eye } from 'lucide-react';
import { getDeterministicColors, hexColorsToVariants, ALL_VARIANTS, type ColorVariant } from '@/lib/utils/colors';
import { useToast } from '@/lib/hooks/useToast';
import { QuizPreviewModal } from '@/components/quiz/QuizPreviewModal';
import { useQuizPreview } from '@/lib/hooks/useQuizPreview';

interface Quiz {
  quizId: string;
  title: string;
  description?: string;
  status: string;
  createdAt: Date;
  hostId: string;
  imageUrl?: string;
  emoji?: string;
}

export function FindQuizClient() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hostingQuizId, setHostingQuizId] = useState<string | null>(null);
  const {
    previewModalOpen,
    previewQuestions,
    previewQuizTitle,
    isLoadingPreview,
    openPreview,
    closePreview,
  } = useQuizPreview();
  const { showToast } = useToast();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async (search?: string) => {
    setIsLoading(true);
    try {
      const url = search 
        ? `/api/quizzes/search?q=${encodeURIComponent(search)}`
        : '/api/quizzes/search';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuizzes(searchQuery);
  };

  const handleHostQuiz = async (quizId: string) => {
    setHostingQuizId(quizId);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to host quiz');
      }

      const session = await response.json();
      router.push(`/host/${session.code}`);
    } catch (error) {
      console.error('Error hosting quiz:', error);
      showToast(error instanceof Error ? error.message : 'Failed to host quiz', 'error');
    } finally {
      setHostingQuizId(null);
    }
  };

  const handlePreview = async (quizId: string, quizTitle: string) => {
    await openPreview(quizId, quizTitle);
  };

  // Use deterministic color assignment based on quiz IDs to prevent hydration mismatches
  const getVariantForQuiz = (quiz: Quiz, index: number): ColorVariant => {
    // Use quiz ID as seed for deterministic color assignment
    const seed = `quiz-${quiz.quizId}`;
    const colors = getDeterministicColors(seed, 1);
    const variant = hexColorsToVariants(colors)[0];
    return variant || ALL_VARIANTS[index % ALL_VARIANTS.length];
  };

  return (
    <>
      <QuizPreviewModal
        isOpen={previewModalOpen}
        onClose={closePreview}
        questions={previewQuestions}
        quizTitle={previewQuizTitle}
      />

      <div className="space-y-8">
        <Card variant="blue" className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder="Search quizzes by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary" size="lg">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </form>
        </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-xl font-bold text-[#1F2937] opacity-80">Loading quizzes...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <Card variant="yellow" className="text-center py-12">
          <Gamepad2 className="w-20 h-20 mx-auto mb-6 opacity-60" />
          <h2 className="text-3xl font-black mb-4">No quizzes found</h2>
          <p className="text-lg font-bold opacity-90">
            {searchQuery 
              ? `No quizzes match "${searchQuery}"` 
              : 'No published quizzes available yet'}
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => {
            const variant = getVariantForQuiz(quiz, index);
            const isHosting = hostingQuizId === quiz.quizId;
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
                  
                  {/* Title and description */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black mb-2">{quiz.title}</h3>
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
                    size="lg"
                    onClick={() => handleHostQuiz(quiz.quizId)}
                    isLoading={isHosting}
                    disabled={isHosting}
                  >
                    {isHosting ? 'Hosting...' : 'Host Quiz'}
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
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}
