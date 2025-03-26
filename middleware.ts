/*
Custom middleware for Clerk authentication.
*/

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/sign-up",
  "/about",
  "/features",
  "/pricing",
  "/contact",
  "/api/webhooks/clerk"
]

export function middleware(req: NextRequest) {
  const { userId } = getAuth(req)
  const { pathname } = req.nextUrl

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => {
    return pathname === path || pathname.startsWith(`${path}/`)
  })

  // If the path is public or the user is authenticated, allow access
  if (isPublicPath || userId) {
    return NextResponse.next()
  }

  // Otherwise, redirect to login
  const loginUrl = new URL("/login", req.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"]
}