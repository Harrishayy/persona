'use client';

import { useState, useEffect, useRef } from 'react';
import type { Question, QuestionType } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { OptionButton } from '@/components/ui/OptionButton';
import { Trash2, Plus, GripVertical, Upload, X } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onChange: (question: Question) => void;
  onDelete: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  rounds?: Array<{ id?: number; order: number; title?: string }>;
  hideHeader?: boolean;
  isEditing?: boolean;
  onImageFileChange?: (index: number, file: File | null) => void;
}

export function QuestionEditor({ question, index, onChange, onDelete, dragHandleProps, rounds, hideHeader = false, isEditing = false, onImageFileChange }: QuestionEditorProps) {
  const [localQuestion, setLocalQuestion] = useState(question);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const previousBlobUrlRef = useRef<string | null>(null);

  // Update local state when question prop changes (e.g., after reordering)
  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  // Cleanup blob URLs when image changes (but not the current one)
  useEffect(() => {
    const previousUrl = previousBlobUrlRef.current;
    const currentUrl = localQuestion.imageUrl;
    
    // Update ref to current URL
    previousBlobUrlRef.current = currentUrl || null;
    
    // Cleanup previous blob URL if it's different from current and is a blob URL
    if (previousUrl && previousUrl !== currentUrl && previousUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previousUrl);
    }
    
    // Cleanup on unmount
    return () => {
      if (currentUrl && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [localQuestion.imageUrl]);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - only allow PNG, JPEG, JPG, WebP
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // Check for HEIC files explicitly
    if (file.type === 'image/heic' || file.type === 'image/heif' || fileExtension === '.heic' || fileExtension === '.heif') {
      showToast('HEIC files are not supported. Please use PNG, JPEG, or JPG format.', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Check if file type is allowed
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      showToast('Please select a PNG, JPEG, JPG, or WebP image file', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('Image size must be less than 5MB', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Cleanup previous blob URL if it exists and is different from current
    if (localQuestion.imageUrl && localQuestion.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localQuestion.imageUrl);
    }
    if (previousBlobUrlRef.current && previousBlobUrlRef.current.startsWith('blob:') && previousBlobUrlRef.current !== localQuestion.imageUrl) {
      URL.revokeObjectURL(previousBlobUrlRef.current);
    }
    
    // Store file as blob URL for preview - will upload to R2 when quiz is saved
    const localPreviewUrl = URL.createObjectURL(file);
    previousBlobUrlRef.current = localPreviewUrl;
    updateQuestion({ imageUrl: localPreviewUrl });
    // Also store the File object for direct upload (avoids blob URL fetch issues)
    onImageFileChange?.(index, file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const content = (
    <div className="space-y-4">
        {/* Rounds feature removed */}

        <Select
          label="Question Type"
          value={localQuestion.type}
          onChange={(value) => {
            const newType = value as QuestionType;
            const needsOptions = newType === 'multiple_choice' || newType === 'true_false';
            updateQuestion({
              type: newType,
              options: needsOptions ? localQuestion.options || [] : undefined,
            });
          }}
          options={[
            { value: 'multiple_choice', label: 'Multiple Choice' },
            { value: 'true_false', label: 'True/False' },
            { value: 'text_input', label: 'Text Input' },
            { value: 'image', label: 'Image Question' },
          ]}
        />

        <Input
          label="Question Text"
          value={localQuestion.text}
          onChange={(e) => updateQuestion({ text: e.target.value })}
          placeholder="Enter your question..."
        />

        {/* Optional image for any question type */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#1F2937]">
            Question Image (Optional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleImageClick}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Choose Image'}
            </Button>
            {localQuestion.imageUrl && (
              <div className="relative">
                <img
                  src={localQuestion.imageUrl}
                  alt="Question preview"
                  className="w-16 h-16 object-cover border-4 border-[#1F2937] rounded-lg"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    // If it's a blob URL that failed, clean it up
                    if (localQuestion.imageUrl && localQuestion.imageUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(localQuestion.imageUrl);
                      previousBlobUrlRef.current = null;
                      updateQuestion({ imageUrl: undefined });
                      onImageFileChange?.(index, null);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    // Cleanup blob URL when removing image
                    const urlToRevoke = localQuestion.imageUrl;
                    if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
                      // Clear the ref first to prevent cleanup effect from trying to revoke it again
                      previousBlobUrlRef.current = null;
                      // Small delay to ensure React has updated before revoking
                      setTimeout(() => {
                        try {
                          URL.revokeObjectURL(urlToRevoke);
                        } catch (e) {
                          // Ignore errors if URL was already revoked
                        }
                      }, 0);
                    }
                    updateQuestion({ imageUrl: undefined });
                  }}
                  className="absolute -top-2 -right-2 bg-[#FCA5A5] text-[#1F2937] rounded-full p-1 hover:scale-110 transition-transform"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          {localQuestion.imageUrl && (
            <p className="text-sm font-bold text-[#6B7280]">
              Image selected. Click the X to remove.
            </p>
          )}
        </div>

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


        <Input
          label="Time Limit (seconds)"
          type="number"
          value={localQuestion.timeLimit || ''}
          onChange={(e) => updateQuestion({ timeLimit: parseInt(e.target.value) || undefined })}
          placeholder="Optional"
        />
      </div>
  );

  if (hideHeader) {
    return content;
  }

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2" {...dragHandleProps}>
          <GripVertical className="w-5 h-5 text-[#6B7280] cursor-grab active:cursor-grabbing" />
          <h3 className="text-lg font-bold text-[#1F2937]">
            Question {index + 1}
          </h3>
        </div>
        <Button variant="danger" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      {content}
    </Card>
  );
}
