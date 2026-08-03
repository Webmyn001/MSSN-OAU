CREATE TABLE "latest_news" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"content" text,
	"image" text NOT NULL,
	"image2" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"author" varchar(255),
	"category" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "latest_news_date_idx" ON "latest_news" USING btree ("date");--> statement-breakpoint
CREATE INDEX "latest_news_category_idx" ON "latest_news" USING btree ("category");
