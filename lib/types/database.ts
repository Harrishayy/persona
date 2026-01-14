/**
 * Database types - these match the exact structure returned by Drizzle ORM
 * Note: Optional fields in database are `null`, not `undefined`
 */

export type QuestionType = 'multiple_choice' | 'true_false' | 'text_input' | 'image';
export type QuizStatus = 'draft' | 'published' | 'archived';
export type SessionStatus = 'waiting' | 'active' | 'finished';
export type GameMode = 'standard' | 'quiplash' | 'fibbage' | 'rate_favourite_drawings' | 'custom';

export interface DatabaseQuestionOption {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
  order: number;
  createdAt: Date;
}

export interface DatabaseQuestion {
  id: number;
  quizId: number;
  roundId: number | null;
  type: QuestionType;
  text: string;
  imageUrl: string | null;
  order: number;
  timeLimit: number | null;
  createdAt: Date;
  options?: DatabaseQuestionOption[];
}

export interface DatabaseRound {
  id: number;
  quizId: number;
  gameMode: string;
  order: number;
  title: string | null;
  description: string | null;
  createdAt: Date;
  questions?: DatabaseQuestion[];
}

export interface DatabaseQuiz {
  id: number;
  title: string;
  description: string | null;
  hostId: string;
  code: string;
  status: string; // Database returns string, needs validation
  imageUrl: string | null;
  emoji: string | null;
  isPublic: boolean;
  gameMode: string;
  draftData: unknown | null;
  createdAt: Date;
  updatedAt: Date;
  questions?: DatabaseQuestion[];
  rounds?: DatabaseRound[];
}

export interface DatabaseParticipant {
  id: number;
  sessionId: number;
  userId: string;
  userName: string | null;
  score: number;
  joinedAt: Date;
}

export interface DatabaseQuizSession {
  id: number;
  quizId: number;
  code: string;
  status: string; // Database returns string, needs validation
  currentQuestionId: number | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  quiz?: DatabaseQuiz;
  participants?: DatabaseParticipant[];
}

export interface DatabaseAnswer {
  id: number;
  sessionId: number;
  questionId: number;
  userId: string;
  answerText: string | null;
  optionId: number | null;
  isCorrect: boolean;
  answeredAt: Date;
}
