-- Al-Mamharah: optional tajweed track (one of the three mutūn) with a
-- placement check after approval, plus the daily line register.
-- Tracks: TUHFATUL_ATFAL | JAZARIYYAH | SHAATIBIYYAH
ALTER TABLE "al_mamharah_applications"
	ADD COLUMN IF NOT EXISTS "tajweed_track" varchar(30);

ALTER TABLE "al_mamharah_participants"
	ADD COLUMN IF NOT EXISTS "tajweed_track" varchar(30);

ALTER TABLE "al_mamharah_participants"
	ADD COLUMN IF NOT EXISTS "tajweed_placement_passed_at" timestamptz;

ALTER TABLE "al_mamharah_completions"
	ADD COLUMN IF NOT EXISTS "matn" varchar(30);

ALTER TABLE "al_mamharah_completions"
	ADD COLUMN IF NOT EXISTS "line_number" integer;
