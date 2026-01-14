CREATE TABLE "question_results" (
	"result_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"shown_at" timestamp DEFAULT now() NOT NULL,
	"answer_distribution" jsonb NOT NULL,
	"total_answers" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rounds') THEN
    ALTER TABLE "rounds" DISABLE ROW LEVEL SECURITY;
    DROP TABLE "rounds" CASCADE;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_constraint WHERE conname = 'questions_round_id_rounds_round_id_fk') THEN
    ALTER TABLE "questions" DROP CONSTRAINT "questions_round_id_rounds_round_id_fk";
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "answers" ALTER COLUMN "answer_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "answers" ALTER COLUMN "answer_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "answers" ALTER COLUMN "session_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "answers" ALTER COLUMN "question_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "answers" ALTER COLUMN "option_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "participant_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "participant_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "session_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "question_options" ALTER COLUMN "option_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "question_options" ALTER COLUMN "option_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "question_options" ALTER COLUMN "question_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "question_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "question_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "quiz_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ALTER COLUMN "session_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ALTER COLUMN "session_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "quiz_sessions" ALTER COLUMN "quiz_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ALTER COLUMN "current_question_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "quiz_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "quiz_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD COLUMN "results_view" varchar(20);--> statement-breakpoint
ALTER TABLE "question_results" ADD CONSTRAINT "question_results_session_id_quiz_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."quiz_sessions"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_results" ADD CONSTRAINT "question_results_question_id_questions_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("question_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'round_id') THEN
    ALTER TABLE "questions" DROP COLUMN "round_id";
  END IF;
END $$;