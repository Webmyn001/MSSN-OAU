CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('MEMBER', 'EXCO');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('PENDING', 'CONFIRMED', 'USED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('PENDING', 'SENT', 'FAILED', 'BOUNCED');--> statement-breakpoint
CREATE TYPE "public"."sms_status" AS ENUM('PENDING', 'SENT', 'FAILED', 'DELIVERED');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"matric_number" varchar(50),
	"role" "user_role" DEFAULT 'MEMBER' NOT NULL,
	"has_2fa" boolean DEFAULT false NOT NULL,
	"two_fa_secret" text,
	"two_fa_backup_codes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "academic_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(20) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academic_sessions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "dues_payments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_reference" varchar(100),
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "excos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"position" varchar(100) NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advisors" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"position" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"venue" varchar(255),
	"image_url" text,
	"ticket_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"max_tickets" integer,
	"tickets_sold" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"ticket_code" varchar(50) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "ticket_status" DEFAULT 'PENDING' NOT NULL,
	"attendee_name" varchar(255),
	"attendee_email" varchar(255),
	"attendee_phone" varchar(20),
	"purchased_at" timestamp with time zone,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_ticket_code_unique" UNIQUE("ticket_code")
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"author" varchar(255) NOT NULL,
	"description" text,
	"isbn" varchar(50),
	"category" varchar(100),
	"cover_image_url" text,
	"file_url" text NOT NULL,
	"file_size" integer,
	"file_type" varchar(20),
	"download_count" integer DEFAULT 0 NOT NULL,
	"embedding" vector(1536),
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"form_id" uuid NOT NULL,
	"submitted_by" uuid,
	"responses" jsonb NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"fields" jsonb NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"allow_multiple_submissions" boolean DEFAULT false NOT NULL,
	"submission_count" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"featured_image_url" text,
	"tags" jsonb,
	"category" varchar(100),
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "article_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipient_email" varchar(255) NOT NULL,
	"subject" varchar(500),
	"template_name" varchar(100),
	"status" "email_status" DEFAULT 'PENDING' NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recipient_phone" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"status" "sms_status" DEFAULT 'PENDING' NOT NULL,
	"error_message" text,
	"cost" numeric(10, 2),
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_config" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "website_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dues_payments" ADD CONSTRAINT "dues_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dues_payments" ADD CONSTRAINT "dues_payments_session_id_academic_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."academic_sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "excos" ADD CONSTRAINT "excos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "excos" ADD CONSTRAINT "excos_session_id_academic_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."academic_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advisors" ADD CONSTRAINT "advisors_session_id_academic_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."academic_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_config" ADD CONSTRAINT "website_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_matric_number_idx" ON "users" USING btree ("matric_number");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "academic_sessions_is_active_idx" ON "academic_sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "academic_sessions_name_idx" ON "academic_sessions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_token_idx" ON "auth_sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "dues_payments_user_session_idx" ON "dues_payments" USING btree ("user_id","session_id");--> statement-breakpoint
CREATE INDEX "dues_payments_session_idx" ON "dues_payments" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "dues_payments_payment_ref_idx" ON "dues_payments" USING btree ("payment_reference");--> statement-breakpoint
CREATE INDEX "excos_user_session_idx" ON "excos" USING btree ("user_id","session_id");--> statement-breakpoint
CREATE INDEX "excos_session_idx" ON "excos" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "advisors_session_idx" ON "advisors" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "events_start_date_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "events_is_public_idx" ON "events" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "events_created_by_idx" ON "events" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "tickets_event_status_idx" ON "tickets" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "tickets_user_status_idx" ON "tickets" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "tickets_ticket_code_idx" ON "tickets" USING btree ("ticket_code");--> statement-breakpoint
CREATE INDEX "books_title_idx" ON "books" USING btree ("title");--> statement-breakpoint
CREATE INDEX "books_author_idx" ON "books" USING btree ("author");--> statement-breakpoint
CREATE INDEX "books_category_idx" ON "books" USING btree ("category");--> statement-breakpoint
CREATE INDEX "books_embedding_idx" ON "books" USING btree ("embedding");--> statement-breakpoint
CREATE INDEX "form_submissions_form_id_idx" ON "form_submissions" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "form_submissions_submitted_by_idx" ON "form_submissions" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "form_submissions_submitted_at_idx" ON "form_submissions" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "forms_is_public_idx" ON "forms" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "forms_created_by_idx" ON "forms" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "articles_slug_idx" ON "article" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "articles_category_idx" ON "article" USING btree ("category");--> statement-breakpoint
CREATE INDEX "articles_published_idx" ON "article" USING btree ("is_published","published_at");--> statement-breakpoint
CREATE INDEX "articles_title_idx" ON "article" USING btree ("title");--> statement-breakpoint
CREATE INDEX "articles_content_idx" ON "article" USING btree ("content");--> statement-breakpoint
CREATE INDEX "email_logs_recipient_idx" ON "email_logs" USING btree ("recipient_email");--> statement-breakpoint
CREATE INDEX "email_logs_status_idx" ON "email_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_logs_created_at_idx" ON "email_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sms_logs_recipient_idx" ON "sms_logs" USING btree ("recipient_phone");--> statement-breakpoint
CREATE INDEX "sms_logs_status_idx" ON "sms_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sms_logs_created_at_idx" ON "sms_logs" USING btree ("created_at");