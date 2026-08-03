-- Newsletter Subscribers table
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
	"id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "newsletter_subscribers_is_active_idx" ON "newsletter_subscribers" USING btree ("is_active");
