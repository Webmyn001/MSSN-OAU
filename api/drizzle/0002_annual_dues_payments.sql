-- Create enum type for annual dues payment status
CREATE TYPE "annual_dues_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Create annual_dues_payments table
CREATE TABLE "annual_dues_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"department" varchar(255) NOT NULL,
	"faculty" varchar(255) NOT NULL,
	"level" varchar(50) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"session_name" varchar(20) NOT NULL,
	"payment_reference" varchar(100) NOT NULL,
	"status" "annual_dues_status" DEFAULT 'PENDING' NOT NULL,
	"receipt_number" varchar(50) NOT NULL,
	"paystack_access_code" varchar(100),
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE INDEX "annual_dues_email_idx" ON "annual_dues_payments" ("email");--> statement-breakpoint
CREATE INDEX "annual_dues_status_idx" ON "annual_dues_payments" ("status");--> statement-breakpoint
CREATE INDEX "annual_dues_payment_ref_idx" ON "annual_dues_payments" ("payment_reference");--> statement-breakpoint
CREATE INDEX "annual_dues_receipt_idx" ON "annual_dues_payments" ("receipt_number");--> statement-breakpoint
CREATE INDEX "annual_dues_session_idx" ON "annual_dues_payments" ("session_name");--> statement-breakpoint
CREATE INDEX "annual_dues_created_at_idx" ON "annual_dues_payments" ("created_at");
