-- Long articles can be split across three optional content blocks.
ALTER TABLE "latest_news" ADD COLUMN IF NOT EXISTS "content2" text;
ALTER TABLE "latest_news" ADD COLUMN IF NOT EXISTS "content3" text;
