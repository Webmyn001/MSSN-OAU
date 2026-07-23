import { z } from 'zod'

// * Environment variable schema using Zod
const envSchema = z.object({
	// * App Configuration
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	APP_URL: z.string().url().default('http://localhost:3000'),
	PORT: z
		.string()
		.transform(Number)
		.pipe(z.number().int().positive())
		.default(() => 3000),
	HOST: z.string().default('0.0.0.0'),

	// * Database
	DATABASE_URL: z.string().url(),

	// * Payment (Paystack)
	PAYSTACK_SECRET_KEY: z.string().min(1),
	PAYSTACK_PUBLIC_KEY: z.string().min(1),

	// * Storage (Cloudflare R2)
	CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
	CLOUDFLARE_ACCESS_KEY_ID: z.string().min(1),
	CLOUDFLARE_SECRET_ACCESS_KEY: z.string().min(1),
	CLOUDFLARE_BUCKET_NAME: z.string().min(1),

	// * Email (Plunk)
	PLUNK_API_KEY: z.string().min(1),
	PLUNK_FROM_EMAIL: z.string().email(),

	// * SMS (Kudisms)
	KUDISMS_API_TOKEN: z.string().min(1),
	KUDISMS_SENDER_ID: z.string().min(1),

	// * AI (Gemini)
	GOOGLE_GEMINI_API_KEY: z.string().min(1),
	// * Optional: OpenAI for embeddings if needed
	OPENAI_API_KEY: z.string().optional(),

	// * Social Media (Optional - may not be required initially)
	FACEBOOK_PAGE_ACCESS_TOKEN: z.string().optional(),
	TWITTER_API_KEY: z.string().optional(),
	TWITTER_API_SECRET: z.string().optional(),
	TWITTER_ACCESS_TOKEN: z.string().optional(),
	TWITTER_ACCESS_SECRET: z.string().optional(),
	INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
	LINKEDIN_CLIENT_ID: z.string().optional(),
	LINKEDIN_CLIENT_SECRET: z.string().optional()
})

// * Infer the type from the schema
export type Env = z.infer<typeof envSchema>

// * Validate and export environment variables
// * This will throw an error on startup if validation fails
let env: Env

try {
	env = envSchema.parse(process.env)
} catch (error) {
	if (error instanceof z.ZodError) {
		console.error('❌ Environment variable validation failed:')
		for (const err of error.issues) {
			console.error(`  - ${err.path.join('.')}: ${err.message}`)
		}
		console.error('\nPlease check your .env file and ensure all required variables are set.')
		process.exit(1)
	}
	throw error
}

export default env
