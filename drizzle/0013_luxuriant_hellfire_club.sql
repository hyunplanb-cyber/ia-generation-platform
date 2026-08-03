ALTER TABLE "project" ADD COLUMN "preset_downloaded_config" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "preset_revisions" integer DEFAULT 0 NOT NULL;