import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const organizationCategories = pgTable("organization_categories", {
  id: text("id").primaryKey(), // Sluggified name, e.g. "ngo", "dog_kennel"
  name: text("name").notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
