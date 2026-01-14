import { z } from 'zod';
import type { GameMode } from '@/lib/types/database';

export const questionOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
  order: z.number().int().min(0),
});

export const questionSchema = z.object({
  type: z.enum(['multiple_choice', 'true_false', 'text_input', 'image']),
  text: z.string().min(1, 'Question text is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0),
  timeLimit: z.number().int().positive().optional(),
  options: z.array(questionOptionSchema).optional(),
}).refine((data) => {
  if (data.type === 'multiple_choice' || data.type === 'true_false') {
    return data.options && data.options.length >= 2;
  }
  return true;
}, {
  message: 'Multiple choice and true/false questions must have at least 2 options',
  path: ['options'],
}).refine((data) => {
  if (data.type === 'multiple_choice' || data.type === 'true_false') {
    const correctOptions = data.options?.filter(opt => opt.isCorrect) || [];
    return correctOptions.length >= 1;
  }
  return true;
}, {
  message: 'At least one option must be marked as correct',
  path: ['options'],
});

export const quizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  emoji: z.string().max(10, 'Emoji must be a single emoji').optional().or(z.literal('')),
  isPublic: z.boolean().optional().default(false),
  gameMode: z.enum(['standard', 'quiplash', 'fibbage', 'rate_favourite_drawings', 'custom']).optional().default('standard'),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export const codeInputSchema = z.object({
  code: z.string().length(6, 'Code must be 6 characters').regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
});

export const answerSubmissionSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  answerText: z.string().optional(),
  optionId: z.string().uuid().optional(),
}).refine((data) => {
  return data.answerText || data.optionId;
}, {
  message: 'Either answerText or optionId must be provided',
});
