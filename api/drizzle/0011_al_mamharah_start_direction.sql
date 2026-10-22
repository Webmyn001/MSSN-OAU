-- Al-Mamharah: revision direction track (upward/downward page progression).
-- Values: BAQARAH_UPWARD | KAHF_UPWARD | KAHF_DOWNWARD | NAS_DOWNWARD
ALTER TABLE "al_mamharah_participants"
	ADD COLUMN IF NOT EXISTS "start_direction" varchar(30);

ALTER TABLE "al_mamharah_applications"
	ADD COLUMN IF NOT EXISTS "start_direction" varchar(30);
