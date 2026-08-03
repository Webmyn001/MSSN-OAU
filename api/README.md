# MSSN OAU API

Hono + Drizzle ORM + PostgreSQL API server. Bun runtime.

## Setup

```sh
bun install
# Configure .env (see below)
bun run db:push   # Push schema to database
bun run dev       # Start dev server on http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (test or live) |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `SMTP_HOST` | SMTP relay host (e.g. `smtp-relay.brevo.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_SECURE` | Use TLS (`true`/`false`) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / API key |
| `SMTP_FROM` | Sender address, e.g. `Name <email@example.com>` |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key |

## API Endpoints

### Public (No Auth)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/health` | Health check |
| GET | `/public/events` | List all events |
| GET | `/public/events/:id` | Get event by ID |
| PUT | `/public/prayer-times` | Update prayer times (file-based) |
| GET | `/public/prayer-times` | Get current prayer times |
| POST | `/public/newsletter/subscribe` | Subscribe to newsletter |
| POST | `/public/newsletter/unsubscribe` | Unsubscribe from newsletter |
| GET | `/public/newsletter/subscribers` | List all subscribers |
| DELETE | `/public/newsletter/subscribers/:id` | Delete subscriber |
| POST | `/public/newsletter/send` | Broadcast email to all active subscribers |
| POST | `/public/newsletter/broadcast-news` | Notify subscribers of new article |
| POST | `/public/annual-dues/initialize` | Initialize annual dues payment (Paystack) |
| GET | `/public/annual-dues/verify/:reference` | Verify payment status |
| GET | `/public/annual-dues/receipt/:receiptNumber` | Get payment receipt |

### Admin Auth (JWT Required for Write Operations)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin-auth/login` | Request OTP (sends email via Plunk) |
| POST | `/admin-auth/verify-otp` | Verify OTP, returns JWT |
| GET | `/admin-auth/validate` | Validate JWT token (GET always public) |

### Authenticated (JWT Required)

All `POST`, `PUT`, `PATCH`, `DELETE` requests (except `/public/*` and `/admin-auth/*`) require a JWT token in the `Authorization: Bearer <token>` header.

GET requests are always public (read-only access).

## Database

PostgreSQL via Drizzle ORM. Run migrations:

```sh
bun run db:push      # Push schema changes
bun run db:studio    # Open Drizzle Studio
```

## Annual Dues Payment Flow

1. POST `/public/annual-dues/initialize` with student details
2. Redirect user to Paystack authorization URL
3. Paystack calls webhook or user returns to callback URL
4. GET `/public/annual-dues/verify/:reference` to confirm payment
5. Receipt available at `/public/annual-dues/receipt/:receiptNumber`

Amount: ₦3,000 per session.
