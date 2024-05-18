CREATE TABLE IF NOT EXISTS "contest_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"contest_id" integer NOT NULL,
	"max_points" integer NOT NULL,
	"min_points" integer DEFAULT 0,
	"answer" text NOT NULL,
	"points_decay_factor" double precision,
	"hints" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contest_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contests_submissions" RENAME TO "contest_submissions";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contest_challenges" ADD CONSTRAINT "contest_challenges_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
