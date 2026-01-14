import { pgTable, text, timestamp, integer, boolean, serial, varchar, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  bio: text('bio'),
  details: text('details'),
  usertag: varchar('usertag', { length: 20 }).notNull().unique(),
  avatarUrl: text('avatar_url'),
});

export const quizzes = pgTable('quizzes', {
  quizId: serial('quiz_id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  hostId: text('host_id').notNull(),
  code: varchar('code', { length: 6 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, published, archived
  imageUrl: text('image_url'),
  emoji: varchar('emoji', { length: 10 }),
  isPublic: boolean('is_public').notNull().default(false),
  gameMode: varchar('game_mode', { length: 20 }).notNull().default('standard'),
  draftData: jsonb('draft_data'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const rounds = pgTable('rounds', {
  roundId: serial('round_id').primaryKey(),
  quizId: integer('quiz_id').notNull().references(() => quizzes.quizId, { onDelete: 'cascade' }),
  gameMode: varchar('game_mode', { length: 20 }).notNull(),
  order: integer('order').notNull(),
  title: varchar('title', { length: 200 }),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const questions = pgTable('questions', {
  questionId: serial('question_id').primaryKey(),
  quizId: integer('quiz_id').notNull().references(() => quizzes.quizId, { onDelete: 'cascade' }),
  roundId: integer('round_id').references(() => rounds.roundId, { onDelete: 'set null' }),
  type: varchar('type', { length: 20 }).notNull(), // multiple_choice, true_false, text_input, image
  text: text('text').notNull(),
  imageUrl: text('image_url'),
  order: integer('order').notNull(),
  timeLimit: integer('time_limit'), // in seconds
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const questionOptions = pgTable('question_options', {
  optionId: serial('option_id').primaryKey(),
  questionId: integer('question_id').notNull().references(() => questions.questionId, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const quizSessions = pgTable('quiz_sessions', {
  sessionId: serial('session_id').primaryKey(),
  quizId: integer('quiz_id').notNull().references(() => quizzes.quizId, { onDelete: 'cascade' }),
  code: varchar('code', { length: 6 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('waiting'), // waiting, active, finished
  currentQuestionId: integer('current_question_id').references(() => questions.questionId),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const participants = pgTable('participants', {
  participantId: serial('participant_id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => quizSessions.sessionId, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  userName: text('user_name'),
  score: integer('score').notNull().default(0),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const answers = pgTable('answers', {
  answerId: serial('answer_id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => quizSessions.sessionId, { onDelete: 'cascade' }),
  questionId: integer('question_id').notNull().references(() => questions.questionId, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  answerText: text('answer_text'),
  optionId: integer('option_id').references(() => questionOptions.optionId),
  isCorrect: boolean('is_correct').notNull().default(false),
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
});

// Relations

export const usersRelations = relations(users, ({ one, many }) => ({
  quizzes: many(quizzes),
}));

export const roundsRelations = relations(rounds, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [rounds.quizId],
    references: [quizzes.quizId],
  }),
  questions: many(questions),
}));

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
  rounds: many(rounds),
  sessions: many(quizSessions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.quizId],
  }),
  round: one(rounds, {
    fields: [questions.roundId],
    references: [rounds.roundId],
  }),
  options: many(questionOptions),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.questionId],
  }),
}));

export const quizSessionsRelations = relations(quizSessions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizSessions.quizId],
    references: [quizzes.quizId],
  }),
  participants: many(participants),
  answers: many(answers),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  session: one(quizSessions, {
    fields: [participants.sessionId],
    references: [quizSessions.sessionId],
  }),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  session: one(quizSessions, {
    fields: [answers.sessionId],
    references: [quizSessions.sessionId],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.questionId],
  }),
}));
