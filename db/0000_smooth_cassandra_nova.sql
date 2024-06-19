DO $$ BEGIN
 CREATE TYPE "public"."team_request_status" AS ENUM('queued', 'delivered', 'accepted', 'cancelled', 'rejected');
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
	"hints" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contest_events" (
	"contest_id" integer NOT NULL,
	"challenge_id" integer,
	"team_id" integer,
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contest_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"submitted_by_team" integer NOT NULL,
	"submitted_by_user" uuid NOT NULL,
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
	"description" text,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"user_id" uuid NOT NULL,
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
	"created_by" uuid NOT NULL,
	"user_email" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"leader" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_name_unique" UNIQUE("name"),
	CONSTRAINT "teams_leader_unique" UNIQUE("leader")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "user_notification_status" DEFAULT 'queued' NOT NULL,
	"for_user_id" uuid NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"email" varchar NOT NULL,
	"metadata" jsonb NOT NULL,
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
 ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_for_user_id_users_id_fk" FOREIGN KEY ("for_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_members_team_index" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_members_user_team_index" ON "team_members" USING btree ("user_id","team_id","left_at");

--> Add RLS to all tables
DO $$
DECLARE t text;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
    LOOP
        EXECUTE format('
            ALTER TABLE %I ENABLE ROW LEVEL SECURITY;
        ', t, t);
    END loop;
END;
$$ LANGUAGE plpgsql;

--> Create Triggers
-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user () returns trigger as $$
begin
  insert into public.users (id, full_name, email, metadata)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user ();