CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"service_id" uuid,
	"name" text NOT NULL,
	"certified_trainer" boolean DEFAULT false NOT NULL,
	"certifier_name" text,
	"dedicated_field" boolean DEFAULT false NOT NULL,
	"training_field_description" text,
	"training_field_address" text,
	"training_field_google_business_profile" text,
	"training_field_google_maps_link" text,
	"parking" boolean DEFAULT false NOT NULL,
	"parking_description" text,
	"details" text,
	"terms_of_participation" text,
	"price" text,
	"price_type" text DEFAULT 'course' NOT NULL,
	"medication_administration" boolean DEFAULT false NOT NULL,
	"medication_administration_details" text,
	"daily_walks" integer,
	"owner_communication" boolean DEFAULT false NOT NULL,
	"owner_communication_details" text,
	"personalized_meal_plan" boolean DEFAULT false NOT NULL,
	"personalized_meal_plan_details" text,
	"checkin" text,
	"checkout" text,
	"faq" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization_category" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"courses_order" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"username" text,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"organization_category" text,
	"address" text,
	"phone_number" text,
	"recovery_email" text,
	"address_country" text,
	"address_state" text,
	"address_city" text,
	"address_line" text,
	"address_zip" text,
	"enabled_services" text,
	"enabled_courses" text,
	"facebook" text,
	"instagram" text,
	"tiktok" text,
	"youtube" text,
	"website" text,
	"google_business_profile" text,
	"billing_company_name" text,
	"billing_tax_id" text,
	"billing_trade_registry_number" text,
	"billing_contact_name" text,
	"billing_contact_phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
