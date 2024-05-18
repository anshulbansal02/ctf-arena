ALTER TABLE "user_notifications" ADD COLUMN "content" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;