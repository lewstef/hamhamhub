import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Extend Auth.js types to include user role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "employee" | "admin" | "organization";
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "employee" | "admin" | "organization";
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            identifier: z.string().min(3),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { identifier, password } = parsedCredentials.data;

          try {
            let user;

            if (identifier.includes("@")) {
              // Clients/Users log in with email
              const [found] = await db
                .select()
                .from(users)
                .where(eq(users.email, identifier))
                .limit(1);
              
              user = found;

              // Users/organizations logging in with email must have the 'user' or 'organization' role
              if (user && user.role !== "user" && user.role !== "organization") {
                return null;
              }
            } else {
              // Staff (employees/admins) log in with username
              const [found] = await db
                .select()
                .from(users)
                .where(eq(users.username, identifier))
                .limit(1);

              user = found;

              // Staff logging in with username must NOT have the 'user' role
              if (user && user.role === "user") {
                return null;
              }
            }

            if (!user) return null;

            const passwordsMatch = await bcrypt.compare(password, user.password);
            if (passwordsMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email ?? "",
                role: user.role,
              };
            }
          } catch (error) {
            console.error("Auth authorize error:", error);
            return null;
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
  },
});
