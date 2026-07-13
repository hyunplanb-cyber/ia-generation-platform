CREATE TABLE "menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name_ko" text NOT NULL,
	"name_en" text NOT NULL,
	"menu_code" text NOT NULL,
	"description" text,
	"desired_features" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu" ADD CONSTRAINT "menu_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "menu_projectId_idx" ON "menu" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "menu_project_menu_code_idx" ON "menu" USING btree ("project_id","menu_code");