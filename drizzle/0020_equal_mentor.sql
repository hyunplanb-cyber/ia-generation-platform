CREATE TABLE "generation_attempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"project_id" uuid,
	"kind" text NOT NULL,
	"size" text,
	"ok" boolean NOT NULL,
	"reason" text,
	"menu_count" integer,
	"screen_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sns_content" ADD COLUMN IF NOT EXISTS "fix_note" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "generation_attempt" ADD CONSTRAINT "generation_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_attempt" ADD CONSTRAINT "generation_attempt_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generation_attempt_user_idx" ON "generation_attempt" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generation_attempt_created_idx" ON "generation_attempt" USING btree ("created_at");