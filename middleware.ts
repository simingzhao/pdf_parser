/*
Authentication middleware temporarily disabled.
Will be implemented later.

Original Clerk authentication configuration:
import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/webhooks(.*)",
    "/api/parse-pdf",
    "/api/extract-data", 
    "/api/stripe/webhooks",
    "/login(.*)",
    "/signup(.*)",
    "/results(.*)"
  ]
});
*/

// No authentication middleware - all routes are accessible
export const config = {
  matcher: [] // Empty matcher means no routes are processed by middleware
};