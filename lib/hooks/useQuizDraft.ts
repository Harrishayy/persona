import { useState, useEffect, useCallback, useRef } from 'react';

export interface DraftState {
  title: string;
  description?: string;
  imageUrl?: string;
  emoji?: string;
  isPublic: boolean;
  gameMode: string;
  rounds?: Array<{
    gameMode: string;
    order: number;
    title?: string;
    description?: string;
  }>;
  questions: Array<{
    type: string;
    text: string;
    imageUrl?: string;
    order: number;
    timeLimit?: number;
    roundId?: number;
    options?: Array<{
      text: string;
      isCorrect: boolean;
      order: number;
    }>;
  }>;
}

export function useQuizDraft() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft on mount
  const loadDraft = useCallback(async (): Promise<DraftState | null> => {
    try {
      const res = await fetch('/api/quizzes/draft');
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return data.draft;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }, []);

  // Save draft
  const saveDraft = useCallback(async (draft: DraftState) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/quizzes/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to save draft:', errorData);
        throw new Error(errorData.error || 'Failed to save draft');
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving draft:', error);
      // Don't throw - just log the error so it doesn't break the UI
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Auto-save with debounce
  const autoSave = useCallback(
    (draft: DraftState) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveDraft(draft);
      }, 30000); // 30 seconds
    },
    [saveDraft]
  );

  // Clear draft
  const clearDraft = useCallback(async () => {
    try {
      await fetch('/api/quizzes/draft', {
        method: 'DELETE',
      });
      setLastSaved(null);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    loadDraft,
    saveDraft,
    autoSave,
    clearDraft,
    isSaving,
    lastSaved,
  };
}
