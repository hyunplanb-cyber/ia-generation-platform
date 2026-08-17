CREATE TABLE "sns_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch" text NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'waiting' NOT NULL,
	"vertical_title" text NOT NULL,
	"horizontal_title" text NOT NULL,
	"ep" text DEFAULT '' NOT NULL,
	"music" text DEFAULT '' NOT NULL,
	"sec_per_card" text DEFAULT '1.8' NOT NULL,
	"caption_youtube" text DEFAULT '' NOT NULL,
	"caption_instagram" text DEFAULT '' NOT NULL,
	"hashtags" text DEFAULT '' NOT NULL,
	"slot_label" text DEFAULT '' NOT NULL,
	"check_result" text DEFAULT '' NOT NULL,
	"youtube_vertical_id" text,
	"youtube_horizontal_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sns_cut" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"ord" integer NOT NULL,
	"caption_json" text DEFAULT '[]' NOT NULL,
	"frame_data_uri" text DEFAULT '' NOT NULL,
	"pose" text DEFAULT '' NOT NULL,
	"clip" text DEFAULT '' NOT NULL,
	"ss" text DEFAULT '' NOT NULL,
	"zoom" text DEFAULT '' NOT NULL,
	"screen_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sns_cut" ADD CONSTRAINT "sns_cut_content_id_sns_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."sns_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sns_content_batch_slug_idx" ON "sns_content" USING btree ("batch","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "sns_cut_content_ord_idx" ON "sns_cut" USING btree ("content_id","ord");