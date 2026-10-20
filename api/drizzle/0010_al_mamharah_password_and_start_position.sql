-- Al-Mamharah: password-based student login + personalised start position.
-- password_hash is NULL until the student picks a password (OTP verified at least once).
ALTER TABLE "al_mamharah_participants"
	ADD COLUMN IF NOT EXISTS "password_hash" text,
	ADD COLUMN IF NOT EXISTS "start_surah" varchar(100),
	ADD COLUMN IF NOT EXISTS "start_page" integer;

-- Applications capture the preferred start point; copied to the participant on approval.
ALTER TABLE "al_mamharah_applications"
	ADD COLUMN IF NOT EXISTS "start_surah" varchar(100),
	ADD COLUMN IF NOT EXISTS "start_page" integer;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "almh_participants_start_position_idx"
	ON "al_mamharah_participants" USING btree ("start_page");
