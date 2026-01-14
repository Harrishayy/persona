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
 * Handles both optionId (from Drizzle schema) and id (from type definition)
 */
export function convertQuestionOption(
  option: DatabaseQuestionOption | any
): QuestionOption {
  // Drizzle returns optionId, but type definition may use id
  const optionId = (option as any).optionId || option.id;
  
  return {
    id: optionId,
    text: option.text,
    isCorrect: option.isCorrect,
    order: option.order,
  };
}

/**
 * Convert database question to app type
 * Handles both questionId (from Drizzle schema) and id (from type definition)
 */
export function convertQuestion(question: DatabaseQuestion | any): Question {
  // Drizzle returns questionId, but type definition may use id
  const questionId = (question as any).questionId || question.id;
  
  return {
    id: questionId,
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
 * Handles both quizId (from Drizzle schema) and id (from type definition)
 */
export function convertQuiz(quiz: DatabaseQuiz | any): Quiz {
  // Drizzle returns quizId, but type definition may use id
  const quizId = (quiz as any).quizId || quiz.id;
  
  return {
    id: quizId,
    title: quiz.title,
    description: quiz.description ?? undefined,
    hostId: quiz.hostId,
    status: validateQuizStatus(quiz.status),
    questions: quiz.questions?.map(convertQuestion),
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  };
}

/**
 * Convert database participant to app type
 * Handles both participantId (from Drizzle schema) and id (from type definition)
 */
export function convertParticipant(participant: DatabaseParticipant | any): Participant {
  // Drizzle returns participantId, but type definition may use id
  const participantId = (participant as any).participantId || participant.id;
  
  return {
    id: participantId,
    sessionId: participant.sessionId,
    userId: participant.userId,
    userName: participant.userName ?? undefined,
    score: participant.score,
    joinedAt: participant.joinedAt,
  };
}

/**
 * Convert database quiz session to app type
 * Handles both sessionId (from Drizzle) and id (from type definition)
 */
export function convertQuizSession(session: DatabaseQuizSession | any): QuizSession {
  // Drizzle returns sessionId, but type definition uses id
  const sessionId = (session as any).sessionId || session.id;
  
  return {
    id: sessionId,
    quizId: session.quizId,
    code: session.code,
    status: validateSessionStatus(session.status),
    currentQuestionId: session.currentQuestionId,
    resultsView: session.resultsView ?? undefined,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    createdAt: session.createdAt,
    quiz: session.quiz ? convertQuiz(session.quiz) : undefined,
    participants: session.participants?.map(convertParticipant),
  };
}
