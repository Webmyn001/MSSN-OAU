CREATE TABLE "programmes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"text" varchar(500),
	"summary" text,
	"description" text,
	"image" text,
	"schedule" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "programmes_title_idx" ON "programmes" USING btree ("title");