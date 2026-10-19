-- Migration 0008 was edited in place across releases, so environments that
-- applied an earlier revision may be missing the TWO_PAGES/KHATM enum members.
-- Since Drizzle skips already-applied migrations by timestamp, the edited 0008
-- never re-runs. Add the values idempotently here (safe on PostgreSQL 12+).
ALTER TYPE "public"."al_mamharah_masar" ADD VALUE IF NOT EXISTS 'TWO_PAGES';--> statement-breakpoint
ALTER TYPE "public"."al_mamharah_masar" ADD VALUE IF NOT EXISTS 'KHATM';
