ALTER TABLE "contest_events" ADD COLUMN "contest_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "contest_events" ADD COLUMN "challenge_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contest_events" ADD CONSTRAINT "contest_events_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contest_events" ADD CONSTRAINT "contest_events_challenge_id_contest_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."contest_challenges"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
