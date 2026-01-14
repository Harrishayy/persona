/**
 * Application types - these are the clean types used throughout the app
 * Optional fields use `undefined` instead of `null`
 */

import type { QuestionType, QuizStatus, SessionStatus, GameMode } from './database';

export type { GameMode };

export interface QuestionOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface Question {
  id?: string;
  type: QuestionType;
  text: string;
  imageUrl?: string;
  order: number;
  timeLimit?: number;
  options?: QuestionOption[];
}

export interface Quiz {
  id?: string;
  title: string;
  description?: string;
  hostId: string;
  status: QuizStatus;
  imageUrl?: string;
  emoji?: string;
  isPublic?: boolean;
  gameMode?: GameMode;
  questions?: Question[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Participant {
  id?: string;
  sessionId: string;
  userId: string;
  userName?: string;
  score: number;
  joinedAt?: Date;
}

export interface QuizSession {
  id?: string;
  quizId: string;
  code: string;
  status: SessionStatus;
  currentQuestionId?: string | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  quiz?: Quiz;
  participants?: Participant[];
  createdAt?: Date;
}

export interface Answer {
  id?: string;
  sessionId: string;
  questionId: string;
  userId: string;
  answerText?: string;
  optionId?: string;
  isCorrect: boolean;
  answeredAt?: Date;
}

export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: Omit<Question, 'id' | 'quizId'>[];
}
