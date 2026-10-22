-- Al-Mamharah: manager-editable placement quiz question bank.
CREATE TABLE IF NOT EXISTS "al_mamharah_placement_questions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"track" varchar(30) NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"answer" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updated_by" varchar(255),
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "almh_placement_questions_track_idx"
	ON "al_mamharah_placement_questions" ("track");

CREATE INDEX IF NOT EXISTS "almh_placement_questions_active_idx"
	ON "al_mamharah_placement_questions" ("active");
