'use client';

import { useState, useCallback } from 'react';
import type { Question } from '@/lib/types/app';
import { convertQuizToQuestions } from '@/lib/utils/quiz-preview';
import { getErrorMessage } from '@/lib/types/errors';
import { useToast } from './useToast';

interface UseQuizPreviewOptions {
  /**
   * Optional custom fetch function for quiz data
   * If not provided, uses the default API endpoint
   */
  fetchQuiz?: (quizId: string) => Promise<any>;
}

interface UseQuizPreviewReturn {
  previewModalOpen: boolean;
  previewQuestions: Question[];
  previewQuizTitle: string;
  isLoadingPreview: boolean;
  openPreview: (quizId: string, quizTitle: string) => Promise<void>;
  closePreview: () => void;
}

/**
 * Custom hook for quiz preview functionality
 * Handles fetching quiz data, converting to questions, and managing preview state
 * 
 * @param options - Optional configuration including custom fetch function
 */
export function useQuizPreview(options?: UseQuizPreviewOptions): UseQuizPreviewReturn {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [previewQuizTitle, setPreviewQuizTitle] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const { showToast } = useToast();

  const fetchQuizData = options?.fetchQuiz || (async (quizId: string) => {
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
    return await response.json();
  });

  const openPreview = useCallback(async (quizId: string, quizTitle: string) => {
    setIsLoadingPreview(true);
    try {
      const quiz = await fetchQuizData(quizId);
      const questions = convertQuizToQuestions(quiz);

      if (questions.length === 0) {
        showToast('This quiz has no questions yet', 'error');
        return;
      }

      setPreviewQuestions(questions);
      setPreviewQuizTitle(quizTitle);
      setPreviewModalOpen(true);
    } catch (error) {
      console.error('Error loading quiz for preview:', error);
      const errorMessage = getErrorMessage(error) || 'Failed to load quiz for preview';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoadingPreview(false);
    }
  }, [fetchQuizData, showToast]);

  const closePreview = useCallback(() => {
    setPreviewModalOpen(false);
    setPreviewQuestions([]);
    setPreviewQuizTitle('');
  }, []);

  return {
    previewModalOpen,
    previewQuestions,
    previewQuizTitle,
    isLoadingPreview,
    openPreview,
    closePreview,
  };
}
