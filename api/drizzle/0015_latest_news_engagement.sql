-- Track article views and allow readers to leave short comments.
ALTER TABLE "latest_news" ADD COLUMN IF NOT EXISTS "views" integer DEFAULT 0 NOT NULL;

CREATE TABLE IF NOT EXISTS "latest_news_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"latest_news_id" uuid NOT NULL REFERENCES "latest_news"("id") ON DELETE cascade,
	"name" varchar(100) NOT NULL,
	"comment" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "latest_news_comments_news_created_idx" ON "latest_news_comments" USING btree ("latest_news_id", "created_at");
