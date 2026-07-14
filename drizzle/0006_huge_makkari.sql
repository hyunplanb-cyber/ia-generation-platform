CREATE TABLE "screen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"menu_id" uuid NOT NULL,
	"page_id" text NOT NULL,
	"page_name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"screen_role" text NOT NULL,
	"device_code" text NOT NULL,
	"func_def" text,
	"prompt" text,
	"page_id_source" text DEFAULT 'auto' NOT NULL,
	"page_name_source" text DEFAULT 'auto' NOT NULL,
	"func_def_source" text DEFAULT 'auto' NOT NULL,
	"prompt_source" text DEFAULT 'auto' NOT NULL,
	"schedule_start" date,
	"schedule_end" date,
	"schedule_locked" boolean DEFAULT false NOT NULL,
	"prompt_feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "screen" ADD CONSTRAINT "screen_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screen" ADD CONSTRAINT "screen_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "screen_projectId_idx" ON "screen" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "screen_menuId_idx" ON "screen" USING btree ("menu_id");--> statement-breakpoint
CREATE UNIQUE INDEX "screen_project_page_id_idx" ON "screen" USING btree ("project_id","page_id");