import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
	console.log('Ensuring newsletter_subscribers table exists...');
	await db.execute(sql`
		CREATE TABLE IF NOT EXISTS newsletter_subscribers (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email VARCHAR(255) NOT NULL UNIQUE,
			name VARCHAR(255),
			is_active BOOLEAN NOT NULL DEFAULT true,
			subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			unsubscribed_at TIMESTAMPTZ
		);
	`);
	await db.execute(sql`
		CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON newsletter_subscribers (email);
	`);
	await db.execute(sql`
		CREATE INDEX IF NOT EXISTS newsletter_subscribers_is_active_idx ON newsletter_subscribers (is_active);
	`);
	console.log('newsletter_subscribers table created successfully!');
	process.exit(0);
}

runMigration().catch(err => {
	console.error('Migration failed:', err);
	process.exit(1);
});
