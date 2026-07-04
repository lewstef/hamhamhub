import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HamHamHub",
  description: "Advanced hamster monitoring and telemetry console.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // Check if any user with role 'admin' exists in the database
  let adminExists = false;
  try {
    const [adminUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);
    adminExists = !!adminUser;
  } catch (error) {
    console.error("Failed to check if admin exists in RootLayout:", error);
  }

  // Redirection rules for initialization
  if (!adminExists) {
    if (pathname !== "/initialization") {
      redirect("/initialization");
    }
  } else {
    if (pathname === "/initialization") {
      redirect("/");
    }
  }

  const session = await auth();
  let dbTheme: "light" | "dark" = "light";

  if (session?.user?.id) {
    try {
      const [dbUser] = await db
        .select({ theme: users.theme })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);
      if (dbUser) {
        dbTheme = dbUser.theme;
      }
    } catch (error) {
      console.error("Failed to fetch initial theme in RootLayout:", error);
    }
  }

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased ${dbTheme === "dark" ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider initialTheme={dbTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
