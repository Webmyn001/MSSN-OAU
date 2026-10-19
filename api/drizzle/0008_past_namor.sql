CREATE TYPE "public"."al_mamharah_application_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."al_mamharah_manager_role" AS ENUM('PRIMARY', 'MANAGER');--> statement-breakpoint
CREATE TYPE "public"."al_mamharah_manager_status" AS ENUM('PENDING', 'ACTIVE', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."al_mamharah_masar" AS ENUM('THREE_PAGES', 'FOUR_PAGES', 'ONE_JUZ', 'THREE_JUZ', 'FOUR_JUZ', 'FIVE_JUZ', 'KHATM');--> statement-breakpoint
CREATE TYPE "public"."al_mamharah_participant_status" AS ENUM('ACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."al_mamharah_task_type" AS ENUM('MUROJAAH', 'TAJWEED_QIRAAT');--> statement-breakpoint
CREATE TABLE "al_mamharah_applications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(30),
	"matric_number" varchar(50) NOT NULL,
	"faculty" varchar(150) NOT NULL,
	"department" varchar(150) NOT NULL,
	"masar" "al_mamharah_masar" NOT NULL,
	"confirmed_memorisation" boolean DEFAULT false NOT NULL,
	"confirmed_tajweed" boolean DEFAULT false NOT NULL,
	"agreed_guidelines" boolean DEFAULT false NOT NULL,
	"status" "al_mamharah_application_status" DEFAULT 'PENDING' NOT NULL,
	"review_notes" text,
	"reviewed_by" varchar(255),
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "al_mamharah_audit_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"actor_type" varchar(20) NOT NULL,
	"actor" varchar(255),
	"action" varchar(100) NOT NULL,
	"entity" varchar(50),
	"entity_id" varchar(100),
	"details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "al_mamharah_completions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"participant_id" uuid NOT NULL,
	"programme_date" date NOT NULL,
	"task_type" "al_mamharah_task_type" DEFAULT 'MUROJAAH' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_by" varchar(255),
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "al_mamharah_manager_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"manager_id" uuid NOT NULL,
	"token" text NOT NULL,
	"type" varchar(30) DEFAULT 'ACTIVATION' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "al_mamharah_manager_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "al_mamharah_managers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"role" "al_mamharah_manager_role" DEFAULT 'MANAGER' NOT NULL,
	"status" "al_mamharah_manager_status" DEFAULT 'PENDING' NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "al_mamharah_participant_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"participant_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	CONSTRAINT "al_mamharah_participant_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "al_mamharah_participants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"application_id" uuid NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"masar" "al_mamharah_masar" NOT NULL,
	"start_date" date NOT NULL,
	"status" "al_mamharah_participant_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "al_mamharah_verification_codes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"participant_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"purpose" varchar(50) DEFAULT 'ENTER_PROGRAMME' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "al_mamharah_completions" ADD CONSTRAINT "al_mamharah_completions_participant_id_al_mamharah_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."al_mamharah_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "al_mamharah_manager_tokens" ADD CONSTRAINT "al_mamharah_manager_tokens_manager_id_al_mamharah_managers_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."al_mamharah_managers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "al_mamharah_participant_sessions" ADD CONSTRAINT "al_mamharah_participant_sessions_participant_id_al_mamharah_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."al_mamharah_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "al_mamharah_participants" ADD CONSTRAINT "al_mamharah_participants_application_id_al_mamharah_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."al_mamharah_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "al_mamharah_verification_codes" ADD CONSTRAINT "al_mamharah_verification_codes_participant_id_al_mamharah_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."al_mamharah_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "almh_applications_email_idx" ON "al_mamharah_applications" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "almh_applications_matric_idx" ON "al_mamharah_applications" USING btree ("matric_number");--> statement-breakpoint
CREATE INDEX "almh_applications_status_idx" ON "al_mamharah_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "almh_applications_created_at_idx" ON "al_mamharah_applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "almh_audit_log_action_idx" ON "al_mamharah_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "almh_audit_log_created_at_idx" ON "al_mamharah_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "almh_completions_day_task_idx" ON "al_mamharah_completions" USING btree ("participant_id","programme_date","task_type");--> statement-breakpoint
CREATE INDEX "almh_completions_participant_idx" ON "al_mamharah_completions" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "almh_completions_date_idx" ON "al_mamharah_completions" USING btree ("programme_date");--> statement-breakpoint
CREATE INDEX "almh_manager_tokens_manager_idx" ON "al_mamharah_manager_tokens" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "almh_manager_tokens_expires_at_idx" ON "al_mamharah_manager_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "almh_managers_email_idx" ON "al_mamharah_managers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "almh_managers_status_idx" ON "al_mamharah_managers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "almh_participant_sessions_participant_idx" ON "al_mamharah_participant_sessions" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "almh_participant_sessions_expires_at_idx" ON "al_mamharah_participant_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "almh_participants_application_idx" ON "al_mamharah_participants" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "almh_participants_email_idx" ON "al_mamharah_participants" USING btree ("email");--> statement-breakpoint
CREATE INDEX "almh_participants_status_idx" ON "al_mamharah_participants" USING btree ("status");--> statement-breakpoint
CREATE INDEX "almh_participants_start_date_idx" ON "al_mamharah_participants" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "almh_verification_codes_participant_idx" ON "al_mamharah_verification_codes" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "almh_verification_codes_expires_at_idx" ON "al_mamharah_verification_codes" USING btree ("expires_at");