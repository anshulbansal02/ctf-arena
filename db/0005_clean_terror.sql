ALTER TABLE "contest_submissions" RENAME COLUMN "contest_id" TO "challenge_id";

DO $$ BEGIN
 ALTER TABLE "contest_submissions" ADD CONSTRAINT "contest_submissions_challenge_id_contest_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."contest_challenges"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
