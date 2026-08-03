CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"wp_id" bigint NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content" text,
	"link" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"featured_image" text,
	"author_name" varchar(255),
	"author_avatar" text,
	"categories" text,
	"tags" text,
	"wp_date" timestamp with time zone NOT NULL,
	"wp_modified" timestamp with time zone,
	"approved" boolean DEFAULT false NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_wp_id_unique" UNIQUE("wp_id")
);
--> statement-breakpoint
CREATE INDEX "blog_posts_wp_id_idx" ON "blog_posts" USING btree ("wp_id");--> statement-breakpoint
CREATE INDEX "blog_posts_approved_idx" ON "blog_posts" USING btree ("approved");--> statement-breakpoint
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");