'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Question } from '@/lib/types/app';

interface QuizPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  quizTitle: string;
}

export function QuizPreviewModal({
  isOpen,
  onClose,
  questions,
  quizTitle,
}: QuizPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first question when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : questions.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < questions.length - 1 ? prev + 1 : 0));
  };

  if (questions.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={quizTitle} size="lg">
        <div className="text-center py-8">
          <p className="text-lg font-bold">No questions to preview</p>
        </div>
      </Modal>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={quizTitle} size="xl">
      <div className="space-y-6">
        {/* Question Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={questions.length <= 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>

          <div className="text-center">
            <p className="text-lg font-black">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={questions.length <= 1}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Question Card */}
        <div className="min-h-[300px]">
          <QuestionCard
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            question={currentQuestion.text}
            imageUrl={currentQuestion.imageUrl}
            colorIndex={currentIndex}
          >
            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border-4 border-[#1F2937] ${
                      option.isCorrect
                        ? 'bg-green-100'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{option.text}</span>
                      {option.isCorrect && (
                        <span className="text-sm font-black text-green-700">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {currentQuestion.type === 'text_input' && (
              <div className="p-4 border-4 border-[#1F2937] bg-gray-100">
                <p className="font-bold text-[#6B7280]">
                  Text input question - players will type their answer
                </p>
              </div>
            )}
          </QuestionCard>
        </div>

        {/* Question Indicators */}
        {questions.length > 1 && (
          <div className="flex justify-center gap-2 flex-wrap">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-[#1F2937] scale-125'
                    : 'bg-[#6B7280] hover:bg-[#1F2937]'
                }`}
                aria-label={`Go to question ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
