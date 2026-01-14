CREATE TABLE "rounds" (
	"round_id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"game_mode" varchar(20) NOT NULL,
	"order" integer NOT NULL,
	"title" varchar(200),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "round_id" integer;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "emoji" varchar(10);--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "game_mode" varchar(20) DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "draft_data" jsonb;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_quiz_id_quizzes_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("quiz_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_round_id_rounds_round_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("round_id") ON DELETE set null ON UPDATE no action;