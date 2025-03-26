/*
Clerk authentication middleware configuration.
*/

import { authMiddleware } from "@clerk/nextjs"

// Paths that don't require authentication
export default authMiddleware({
  publicRoutes: [
    "/",
    "/login(.*)",
    "/signup(.*)",
    "/about",
    "/features",
    "/pricing",
    "/contact",
    "/api/webhooks(.*)"
  ]
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"]
}