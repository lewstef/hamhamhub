import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// In Next.js 16+, middleware is renamed to proxy
export const proxy = auth((req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  // Protect all dashboard routes, allow public assets and APIs
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
