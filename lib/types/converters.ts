/**
 * Type converters - convert database types to app types
 * Handles null -> undefined conversion and type validation
 */

import type {
  DatabaseQuiz,
  DatabaseQuizSession,
  DatabaseQuestion,
  DatabaseQuestionOption,
  DatabaseParticipant,
  QuizStatus,
  SessionStatus,
} from './database';
import type {
  Quiz,
  QuizSession,
  Question,
  QuestionOption,
  Participant,
} from './app';

/**
 * Validates and converts database status string to typed status
 */
function validateQuizStatus(status: string): QuizStatus {
  if (status === 'draft' || status === 'published' || status === 'archived') {
    return status;
  }
  return 'draft'; // Default fallback
}

function validateSessionStatus(status: string): SessionStatus {
  if (status === 'waiting' || status === 'active' || status === 'finished') {
    return status;
  }
  return 'waiting'; // Default fallback
}

/**
 * Convert database question option to app type
 */
export function convertQuestionOption(
  option: DatabaseQuestionOption
): QuestionOption {
  return {
    id: option.id,
    text: option.text,
    isCorrect: option.isCorrect,
    order: option.order,
  };
}

/**
 * Convert database question to app type
 */
export function convertQuestion(question: DatabaseQuestion): Question {
  return {
    id: question.id,
    type: question.type,
    text: question.text,
    imageUrl: question.imageUrl ?? undefined,
    order: question.order,
    timeLimit: question.timeLimit ?? undefined,
    options: question.options?.map(convertQuestionOption),
  };
}

/**
 * Convert database quiz to app type
 */
export function convertQuiz(quiz: DatabaseQuiz): Quiz {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description ?? undefined,
    hostId: quiz.hostId,
    code: quiz.code,
    status: validateQuizStatus(quiz.status),
    questions: quiz.questions?.map(convertQuestion),
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  };
}

/**
 * Convert database participant to app type
 */
export function convertParticipant(participant: DatabaseParticipant): Participant {
  return {
    id: participant.id,
    sessionId: participant.sessionId,
    userId: participant.userId,
    userName: participant.userName ?? undefined,
    score: participant.score,
    joinedAt: participant.joinedAt,
  };
}

/**
 * Convert database quiz session to app type
 */
export function convertQuizSession(session: DatabaseQuizSession): QuizSession {
  return {
    id: session.id,
    quizId: session.quizId,
    code: session.code,
    status: validateSessionStatus(session.status),
    currentQuestionId: session.currentQuestionId,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    createdAt: session.createdAt,
    quiz: session.quiz ? convertQuiz(session.quiz) : undefined,
    participants: session.participants?.map(convertParticipant),
  };
}
