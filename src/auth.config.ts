import type { NextAuthConfig, DefaultSession } from "next-auth";

// Extend NextAuth types within config so that TypeScript is aware of custom properties during middleware execution
declare module "next-auth" {
  interface User {
    role?: "user" | "employee" | "admin" | "organization";
  }
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

export const authConfig = {
  pages: {
    // Fallback sign-in page for next-auth internal routing
    signIn: "/dashboard/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const isOnBackofficeLogin = nextUrl.pathname === "/backoffice/login";
      const isOnDashboardLogin = nextUrl.pathname === "/dashboard/login";
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") && !isOnDashboardLogin;
      const isOnBackoffice = nextUrl.pathname.startsWith("/backoffice") && !isOnBackofficeLogin;

      // If accessing login routes, handle redirection if already authenticated
      if (isOnBackofficeLogin || isOnDashboardLogin) {
        if (isLoggedIn) {
          const target = (role === "admin" || role === "employee") ? "/backoffice" : "/dashboard";
          return Response.redirect(new URL(target, nextUrl));
        }
        return true;
      }

      if (isOnBackoffice) {
        if (isLoggedIn && (role === "admin" || role === "employee")) {
          return true;
        }
        // Redirect standard logged-in users to /dashboard if they try to access backoffice
        if (isLoggedIn && role === "user") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        // Redirect unauthenticated users to staff login page
        return Response.redirect(new URL("/backoffice/login", nextUrl));
      }

      if (isOnDashboard) {
        if (isLoggedIn && (role === "user" || role === "organization")) {
          return true;
        }
        // Redirect logged-in admin/employee to /backoffice if they try to access user dashboard
        if (isLoggedIn && (role === "admin" || role === "employee")) {
          return Response.redirect(new URL("/backoffice", nextUrl));
        }
        // Redirect unauthenticated users to user login page
        return Response.redirect(new URL("/dashboard/login", nextUrl));
      }

      // If user is already logged in and attempts to access signup page, redirect to portal
      if (isLoggedIn && nextUrl.pathname === "/signup") {
        const target = (role === "admin" || role === "employee") ? "/backoffice" : "/dashboard";
        return Response.redirect(new URL(target, nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.role) {
        session.user.role = token.role as "user" | "employee" | "admin";
      }
      return session;
    },
  },
  providers: [], // Configured in src/auth.ts
} satisfies NextAuthConfig;
