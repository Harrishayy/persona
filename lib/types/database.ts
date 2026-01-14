/**
 * Database types - these match the exact structure returned by Drizzle ORM
 * Note: Optional fields in database are `null`, not `undefined`
 */

export type QuestionType = 'multiple_choice' | 'true_false' | 'text_input' | 'image';
export type QuizStatus = 'draft' | 'published' | 'archived';
export type SessionStatus = 'waiting' | 'active' | 'finished';
export type GameMode = 'standard' | 'quiplash' | 'fibbage' | 'rate_favourite_drawings' | 'custom';

export interface DatabaseQuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
  createdAt: Date;
}

export interface DatabaseQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  text: string;
  imageUrl: string | null;
  order: number;
  timeLimit: number | null;
  createdAt: Date;
  options?: DatabaseQuestionOption[];
}

export interface DatabaseQuiz {
  id: string;
  title: string;
  description: string | null;
  hostId: string;
  status: string; // Database returns string, needs validation
  imageUrl: string | null;
  emoji: string | null;
  isPublic: boolean;
  gameMode: string;
  draftData: unknown | null;
  createdAt: Date;
  updatedAt: Date;
  questions?: DatabaseQuestion[];
}

export interface DatabaseParticipant {
  id: string;
  sessionId: string;
  userId: string;
  userName: string | null;
  score: number;
  joinedAt: Date;
}

export interface DatabaseQuizSession {
  id: string;
  quizId: string;
  code: string;
  status: string; // Database returns string, needs validation
  currentQuestionId: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  quiz?: DatabaseQuiz;
  participants?: DatabaseParticipant[];
}

export interface DatabaseAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  userId: string;
  answerText: string | null;
  optionId: string | null;
  isCorrect: boolean;
  answeredAt: Date;
}
