import { pgTable, text, timestamp, integer, boolean, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  hostId: text('host_id').notNull(),
  code: varchar('code', { length: 6 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, published, archived
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(), // multiple_choice, true_false, text_input, image
  text: text('text').notNull(),
  imageUrl: text('image_url'),
  order: integer('order').notNull(),
  timeLimit: integer('time_limit'), // in seconds
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const questionOptions = pgTable('question_options', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const quizSessions = pgTable('quiz_sessions', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 6 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('waiting'), // waiting, active, finished
  currentQuestionId: integer('current_question_id').references(() => questions.id),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const participants = pgTable('participants', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => quizSessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userName: text('user_name'),
  score: integer('score').notNull().default(0),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const answers = pgTable('answers', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => quizSessions.id, { onDelete: 'cascade' }),
  questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  answerText: text('answer_text'),
  optionId: integer('option_id').references(() => questionOptions.id),
  isCorrect: boolean('is_correct').notNull().default(false),
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
});

// Relations
export const quizzesRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
  sessions: many(quizSessions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  options: many(questionOptions),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.id],
  }),
}));

export const quizSessionsRelations = relations(quizSessions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizSessions.quizId],
    references: [quizzes.id],
  }),
  participants: many(participants),
  answers: many(answers),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  session: one(quizSessions, {
    fields: [participants.sessionId],
    references: [quizSessions.id],
  }),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  session: one(quizSessions, {
    fields: [answers.sessionId],
    references: [quizSessions.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));
