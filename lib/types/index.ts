/**
 * Central type exports
 * Import types from here for clean, organized imports
 */

// Re-export database types
export type {
  QuestionType,
  QuizStatus,
  SessionStatus,
  DatabaseQuestionOption,
  DatabaseQuestion,
  DatabaseQuiz,
  DatabaseParticipant,
  DatabaseQuizSession,
  DatabaseAnswer,
} from './database';

// Re-export app types
export type {
  QuestionOption,
  Question,
  Quiz,
  Participant,
  QuizSession,
  Answer,
  QuizTemplate,
} from './app';
