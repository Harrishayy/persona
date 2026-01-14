'use client';

import { useState } from 'react';
import type { Question, QuestionType } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OptionButton } from '@/components/ui/OptionButton';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onChange: (question: Question) => void;
  onDelete: () => void;
}

export function QuestionEditor({ question, index, onChange, onDelete }: QuestionEditorProps) {
  const [localQuestion, setLocalQuestion] = useState(question);

  const updateQuestion = (updates: Partial<Question>) => {
    const updated = { ...localQuestion, ...updates };
    setLocalQuestion(updated);
    onChange(updated);
  };

  const addOption = () => {
    const newOptions = [
      ...(localQuestion.options || []),
      {
        text: '',
        isCorrect: false,
        order: localQuestion.options?.length || 0,
      },
    ];
    updateQuestion({ options: newOptions });
  };

  const updateOption = (optionIndex: number, updates: Partial<NonNullable<typeof localQuestion.options>[0]>) => {
    const newOptions = [...(localQuestion.options || [])];
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
    updateQuestion({ options: newOptions });
  };

  const deleteOption = (optionIndex: number) => {
    const newOptions = localQuestion.options?.filter((_, i) => i !== optionIndex) || [];
    updateQuestion({ options: newOptions });
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-[#6B7280]" />
          <h3 className="text-lg font-bold text-[#1F2937]">
            Question {index + 1}
          </h3>
        </div>
        <Button variant="danger" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-[#1F2937] mb-2">
            Question Type
          </label>
          <select
            value={localQuestion.type}
            onChange={(e) => {
              const newType = e.target.value as QuestionType;
              const needsOptions = newType === 'multiple_choice' || newType === 'true_false';
              updateQuestion({
                type: newType,
                options: needsOptions ? localQuestion.options || [] : undefined,
              });
            }}
            className="w-full px-4 py-3 border-4 border-[#1F2937] bg-white text-[#1F2937] font-medium focus:outline-none focus:ring-4 focus:ring-[#A78BFA] focus:ring-offset-2 transition-all duration-200"
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
            <option value="text_input">Text Input</option>
            <option value="image">Image Question</option>
          </select>
        </div>

        <Input
          label="Question Text"
          value={localQuestion.text}
          onChange={(e) => updateQuestion({ text: e.target.value })}
          placeholder="Enter your question..."
        />

        {(localQuestion.type === 'multiple_choice' || localQuestion.type === 'true_false') && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-[#1F2937]">
                Options
              </label>
              <Button variant="secondary" size="sm" onClick={addOption}>
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {localQuestion.options?.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(optIndex, { text: e.target.value })}
                    placeholder={`Option ${optIndex + 1}`}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={(e) => updateOption(optIndex, { isCorrect: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-[#1F2937] accent-[#86EFAC]"
                    />
                    <span className="text-sm font-bold text-[#1F2937]">Correct</span>
                  </label>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteOption(optIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {localQuestion.type === 'image' && (
          <Input
            label="Image URL"
            type="url"
            value={localQuestion.imageUrl || ''}
            onChange={(e) => updateQuestion({ imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        )}

        <Input
          label="Time Limit (seconds)"
          type="number"
          value={localQuestion.timeLimit || ''}
          onChange={(e) => updateQuestion({ timeLimit: parseInt(e.target.value) || undefined })}
          placeholder="Optional"
        />
      </div>
    </Card>
  );
}
