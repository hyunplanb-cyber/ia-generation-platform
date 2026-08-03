CREATE TABLE "pack_order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"user_id" text NOT NULL,
	"package_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"amount_krw" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	CONSTRAINT "pack_order_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
ALTER TABLE "pack_order" ADD CONSTRAINT "pack_order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pack_order_user_idx" ON "pack_order" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pack_order_owned_idx" ON "pack_order" USING btree ("user_id","package_id","plan_id","status");