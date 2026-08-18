CREATE TABLE "organization_enabled_courses" (
	"organization_id" uuid NOT NULL,
	"course_id" text NOT NULL,
	CONSTRAINT "organization_enabled_courses_organization_id_course_id_pk" PRIMARY KEY("organization_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "organization_enabled_services" (
	"organization_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	CONSTRAINT "organization_enabled_services_organization_id_service_id_pk" PRIMARY KEY("organization_id","service_id")
);
--> statement-breakpoint
ALTER TABLE "organization_enabled_courses" ADD CONSTRAINT "organization_enabled_courses_organization_id_users_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_enabled_services" ADD CONSTRAINT "organization_enabled_services_organization_id_users_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_enabled_services" ADD CONSTRAINT "organization_enabled_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "organization_enabled_services" ("organization_id", "service_id")
SELECT
  "id" AS "organization_id",
  CAST(trim(s.service_id) AS uuid) AS "service_id"
FROM "users" u
CROSS JOIN LATERAL regexp_split_to_table(u."enabled_services", ',') AS s(service_id)
WHERE u."enabled_services" IS NOT NULL AND trim(s.service_id) != ''
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "organization_enabled_courses" ("organization_id", "course_id")
SELECT
  "id" AS "organization_id",
  trim(c.course_id) AS "course_id"
FROM "users" u
CROSS JOIN LATERAL regexp_split_to_table(u."enabled_courses", ',') AS c(course_id)
WHERE u."enabled_courses" IS NOT NULL AND trim(c.course_id) != ''
ON CONFLICT DO NOTHING;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "enabled_services";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "enabled_courses";