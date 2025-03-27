/*
Clerk authentication middleware configuration.
*/

import { clerkMiddleware } from "@clerk/nextjs/server"

// Paths that don't require authentication
export default clerkMiddleware()

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"]
}