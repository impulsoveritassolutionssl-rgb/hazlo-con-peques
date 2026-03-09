import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/registro",
  "/recuperar",
  "/reset",
  "/verificar-email",
  "/privacy-policy",
  "/terms-of-service",

  // Activities public routes
  "/actividades",

  //stripe routes here
  "/stripe/demo",
  "/stripe/success",
  "/stripe/cancel",
];

// Role-based dashboard routes
const roleDashboardRoutes: Record<string, string> = {
  organizador: "/dashboard/organizador",
  padre: "/dashboard/padre",
  peque: "/dashboard/peque",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response
  const response = NextResponse.next();

  // Set CSP headers to allow iframe embedding from Totalum frontend and localhost
  response.headers.set("Content-Security-Policy", "frame-ancestors 'self' https://web.totalum.app https://totalum-frontend-test.web.app http://localhost:8100");
  response.headers.delete("X-Frame-Options"); // Remove X-Frame-Options if present

  // Allow all API routes and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return response;
  }

  // Check session cookie for protected routes (lightweight Edge-compatible check)
  // Better Auth uses "better-auth.session_token" or "__Secure-better-auth.session_token" (when secure)
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie) {
    // Redirect to login if no session cookie found
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.headers.set("Content-Security-Policy", "frame-ancestors 'self' https://web.totalum.app https://totalum-frontend-test.web.app http://localhost:8100");
    return redirectResponse;
  }

  // Check if user is accessing a dashboard route they shouldn't access
  // This is a basic check - full role validation happens server-side
  const userRoleCookie = request.cookies.get("user_role");
  const userRole = userRoleCookie?.value;

  if (userRole && pathname.startsWith("/dashboard/")) {
    // Check if user is accessing their correct dashboard
    const allowedDashboard = roleDashboardRoutes[userRole];

    // If user tries to access a different role's dashboard
    if (allowedDashboard && !pathname.startsWith(allowedDashboard)) {
      const redirectResponse = NextResponse.redirect(new URL(allowedDashboard, request.url));
      redirectResponse.headers.set("Content-Security-Policy", "frame-ancestors 'self' https://web.totalum.app https://totalum-frontend-test.web.app http://localhost:8100");
      return redirectResponse;
    }
  }

  // Cookie exists - allow access
  // Note: Full session validation happens in Server Components/API routes
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
