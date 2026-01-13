'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, QuizTemplate } from '@/lib/utils/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { QuestionEditor } from './QuestionEditor';
import { createQuiz } from '@/app/(app)/actions/quiz';
import { Plus } from 'lucide-react';
import { getErrorMessage } from '@/lib/types/errors';

interface QuizCreatorProps {
  initialTemplate?: QuizTemplate | null;
}

export function QuizCreator({ initialTemplate }: QuizCreatorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTemplate?.name || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [questions, setQuestions] = useState<Question[]>(
    initialTemplate?.questions || [
      {
        type: 'multiple_choice',
        text: '',
        order: 0,
        options: [
          { text: '', isCorrect: false, order: 0 },
          { text: '', isCorrect: false, order: 1 },
        ],
      },
    ]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      alert('Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createQuiz({
        title,
        description,
        questions: questions.map((q, i) => ({
          ...q,
          order: i,
        })),
      });
      router.push(`/host/${result.code}`);
    } catch (error: unknown) {
      alert(getErrorMessage(error) || 'Failed to create quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card variant="purple" className="text-white">
        <h1 className="text-4xl font-black mb-6">
          Create Your Quiz
        </h1>
        <div className="space-y-4">
          <Input
            label="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title..."
          />
          <Input
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your quiz..."
          />
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Questions ({questions.length})
          </h2>
          <Button variant="secondary" onClick={addQuestion}>
            <Plus className="w-5 h-5 mr-2" />
            Add Question
          </Button>
        </div>
        {questions.map((question, index) => (
          <QuestionEditor
            key={index}
            question={question}
            index={index}
            onChange={(q) => updateQuestion(index, q)}
            onDelete={() => deleteQuestion(index)}
          />
        ))}
      </div>

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
          Create Quiz
        </Button>
      </div>
    </div>
  );
}
