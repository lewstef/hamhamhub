import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const organizationCategories = pgTable("organization_categories", {
  id: text("id").primaryKey(), // Sluggified name, e.g. "ngo", "dog_kennel"
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique(), // nullable for employee/admin logins
  username: text("username").unique(), // nullable for user logins
  password: text("password").notNull(), // hashed
  role: text("role").$type<"user" | "employee" | "admin" | "organization">().default("user").notNull(),
  theme: text("theme").$type<"light" | "dark">().default("light").notNull(),
  organizationCategory: text("organization_category"),
  address: text("address"),
  phoneNumber: text("phone_number"),
  recoveryEmail: text("recovery_email"),
  addressCountry: text("address_country"),
  addressState: text("address_state"),
  addressCity: text("address_city"),
  addressLine: text("address_line"),
  addressZip: text("address_zip"),
  enabledServices: text("enabled_services"),
  enabledCourses: text("enabled_courses"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  youtube: text("youtube"),
  website: text("website"),
  googleBusinessProfile: text("google_business_profile"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  organizationCategory: text("organization_category").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  coursesOrder: text("courses_order"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceTypes = pgTable("service_types", {
  id: text("id").primaryKey(), // e.g., "dog_training"
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
