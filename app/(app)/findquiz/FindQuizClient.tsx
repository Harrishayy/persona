'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Gamepad2 } from 'lucide-react';
import { getDeterministicColors, hexColorsToVariants, ALL_VARIANTS, type ColorVariant } from '@/lib/utils/colors';

interface Quiz {
  quizId: number;
  title: string;
  description?: string;
  code: string;
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
  const [hostingQuizId, setHostingQuizId] = useState<number | null>(null);

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

  const handleHostQuiz = async (quizId: number) => {
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
      alert(error instanceof Error ? error.message : 'Failed to host quiz');
    } finally {
      setHostingQuizId(null);
    }
  };

  // Use deterministic color assignment based on quiz IDs to prevent hydration mismatches
  const getVariantForQuiz = (quiz: Quiz, index: number): ColorVariant => {
    // Use quiz ID as seed for deterministic color assignment
    const seed = `quiz-${quiz.quizId}-${quiz.code}`;
    const colors = getDeterministicColors(seed, 1);
    const variant = hexColorsToVariants(colors)[0];
    return variant || ALL_VARIANTS[index % ALL_VARIANTS.length];
  };

  return (
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
                <div className="mb-4">
                  {quiz.emoji && (
                    <div className="text-4xl mb-2">{quiz.emoji}</div>
                  )}
                  {quiz.imageUrl && !quiz.emoji && (
                    <img
                      src={quiz.imageUrl}
                      alt={quiz.title}
                      className="w-full h-32 object-cover mb-2 border-4 border-[#1F2937] rounded-lg"
                    />
                  )}
                </div>
                <h3 className="text-2xl font-black mb-2">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-base font-bold opacity-90 mb-4 flex-grow">
                    {quiz.description}
                  </p>
                )}
                <div className="mt-auto pt-4">
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
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
