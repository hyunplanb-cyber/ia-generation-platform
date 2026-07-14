CREATE TABLE "button_action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"screen_id" uuid NOT NULL,
	"label" text NOT NULL,
	"target_screen_id" uuid NOT NULL,
	"target_page_id_snapshot" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "button_action" ADD CONSTRAINT "button_action_screen_id_screen_id_fk" FOREIGN KEY ("screen_id") REFERENCES "public"."screen"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "button_action" ADD CONSTRAINT "button_action_target_screen_id_screen_id_fk" FOREIGN KEY ("target_screen_id") REFERENCES "public"."screen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "button_action_screenId_idx" ON "button_action" USING btree ("screen_id");--> statement-breakpoint
CREATE INDEX "button_action_targetScreenId_idx" ON "button_action" USING btree ("target_screen_id");