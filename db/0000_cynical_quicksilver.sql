DO $$ BEGIN
 CREATE TYPE "public"."contest_participation_type" AS ENUM('individual', 'team');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."team_request_status" AS ENUM('queued', 'sent', 'delivered', 'accepted', 'cancelled', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."team_request_type" AS ENUM('invite', 'request');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_notification_status" AS ENUM('queued', 'delivered', 'seen');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contest_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"contest_id" integer NOT NULL,
	"order" integer NOT NULL,
	"max_points" integer NOT NULL,
	"min_points" integer DEFAULT 0,
	"answer" text NOT NULL,
	"points_decay_factor" double precision,
	"hints" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contest_events" (
	"contest_id" integer NOT NULL,
	"challenge_id" integer,
	"team_id" integer,
	"user_id" text,
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contest_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"submitted_by_team" integer NOT NULL,
	"submitted_by_user" text NOT NULL,
	"time_taken" integer NOT NULL,
	"submission" text,
	"score" integer NOT NULL,
	"contest_id" integer NOT NULL,
	"challenge_id" integer NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_description" text DEFAULT '',
	"description" text,
	"unranked" boolean DEFAULT false,
	"game" text NOT NULL,
	"participation_type" "contest_participation_type" NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"game_state" jsonb DEFAULT '{}'::jsonb,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participant_contest_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"team_id" integer,
	"contest_id" integer NOT NULL,
	"challenge_id" integer,
	"config" jsonb DEFAULT '{}'::jsonb,
	"state" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"user_id" text NOT NULL,
	"team_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"status" "team_request_status" DEFAULT 'queued' NOT NULL,
	"type" "team_request_type" NOT NULL,
	"created_by" text NOT NULL,
	"user_email" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"abandoned" boolean DEFAULT false,
	"leader" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_name_unique" UNIQUE("name"),
	CONSTRAINT "teams_leader_unique" UNIQUE("leader")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "user_notification_status" DEFAULT 'queued' NOT NULL,
	"for_user_id" text NOT NULL,
	"content" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contest_challenges" ADD CONSTRAINT "contest_challenges_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contest_events" ADD CONSTRAINT "contest_events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contest_events" ADD CONSTRAINT "contest_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contest_submissions" ADD CONSTRAINT "contest_submissions_submitted_by_team_teams_id_fk" FOREIGN KEY ("submitted_by_team") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contest_submissions" ADD CONSTRAINT "contest_submissions_submitted_by_user_users_id_fk" FOREIGN KEY ("submitted_by_user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contest_submissions" ADD CONSTRAINT "contest_submissions_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contest_submissions" ADD CONSTRAINT "contest_submissions_challenge_id_contest_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."contest_challenges"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participant_contest_challenges" ADD CONSTRAINT "participant_contest_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participant_contest_challenges" ADD CONSTRAINT "participant_contest_challenges_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participant_contest_challenges" ADD CONSTRAINT "participant_contest_challenges_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participant_contest_challenges" ADD CONSTRAINT "participant_contest_challenges_challenge_id_contest_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."contest_challenges"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_requests" ADD CONSTRAINT "team_requests_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_leader_users_id_fk" FOREIGN KEY ("leader") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_for_user_id_users_id_fk" FOREIGN KEY ("for_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_members_team_index" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_members_user_team_index" ON "team_members" USING btree ("user_id","team_id","left_at");