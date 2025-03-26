/*
Webhook handler for Clerk authentication events.
*/

import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  // Get the headers
  const headersList = headers()
  const svix_id = headersList.get("svix-id")
  const svix_timestamp = headersList.get("svix-timestamp")
  const svix_signature = headersList.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: WebhookEvent

  // Verify the webhook payload
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", { status: 400 })
  }

  // Handle user events
  const eventType = evt.type

  if (eventType === "user.created" || eventType === "user.updated") {
    // Handle user creation or update
    const { id, email_addresses, ...userData } = evt.data

    // Log for now, but can add database operations later
    console.log(`User ${eventType}:`, id, email_addresses)
  }

  return new Response("Webhook received", { status: 200 })
}
