CREATE TABLE "system_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "trainer_experience_description" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "surveillance_247" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "surveillance_247_details" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "web_cam" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "web_cam_details" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "checkin_weekend" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "checkout_weekend" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "schedule" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "age_limits_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "age_limits" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "coverage_zones" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "billing_euid" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "billing_bank_account_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "billing_bank_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "billing_contact_email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "billing_secondary_contact_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "billing_secondary_contact_phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "billing_secondary_contact_email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_status" text DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_requested_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_notes" text;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_organization_id_users_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;