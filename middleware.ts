/*
Contains middleware for the application.
No authentication is required for the MVP.
*/

import { NextResponse } from "next/server"

export default function middleware(req: Request) {
  return NextResponse.next()
}

export const config = {
  matcher: []
}