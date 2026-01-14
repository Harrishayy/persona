/**
 * Application types - these are the clean types used throughout the app
 * Optional fields use `undefined` instead of `null`
 */

import type { QuestionType, QuizStatus, SessionStatus, GameMode } from './database';

export type { GameMode };

export interface QuestionOption {
  id?: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface Round {
  id?: number;
  quizId?: number;
  gameMode: GameMode;
  order: number;
  title?: string;
  description?: string;
  questions?: Question[];
}

export interface Question {
  id?: number;
  type: QuestionType;
  text: string;
  imageUrl?: string;
  order: number;
  timeLimit?: number;
  roundId?: number;
  options?: QuestionOption[];
}

export interface Quiz {
  id?: number;
  title: string;
  description?: string;
  hostId: string;
  code: string;
  status: QuizStatus;
  imageUrl?: string;
  emoji?: string;
  isPublic?: boolean;
  gameMode?: GameMode;
  questions?: Question[];
  rounds?: Round[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Participant {
  id?: number;
  sessionId: number;
  userId: string;
  userName?: string;
  score: number;
  joinedAt?: Date;
}

export interface QuizSession {
  id?: number;
  quizId: number;
  code: string;
  status: SessionStatus;
  currentQuestionId?: number | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  quiz?: Quiz;
  participants?: Participant[];
  createdAt?: Date;
}

export interface Answer {
  id?: number;
  sessionId: number;
  questionId: number;
  userId: string;
  answerText?: string;
  optionId?: number;
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
