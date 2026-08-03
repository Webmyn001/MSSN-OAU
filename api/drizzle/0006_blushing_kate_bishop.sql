ALTER TABLE "blog_posts" ADD COLUMN "approved_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "blog_posts" SET "approved_at" = "updated_at" WHERE "approved" = true;